from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import hashlib
import secrets
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), "smart_parking.db")

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_token():
    return secrets.token_hex(32)

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Parking slots
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS parking_slots (
            slot_id INTEGER PRIMARY KEY AUTOINCREMENT,
            slot_number TEXT UNIQUE NOT NULL,
            status TEXT DEFAULT 'available',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Vehicles
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vehicles (
            vehicle_id INTEGER PRIMARY KEY AUTOINCREMENT,
            vehicle_number TEXT NOT NULL,
            slot_number TEXT,
            entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            exit_time TIMESTAMP,
            status TEXT DEFAULT 'active',
            parking_duration INTEGER
        )
    """)

    # Bookings with approval flow
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL,
            vehicle_number TEXT NOT NULL,
            slot_number TEXT NOT NULL,
            booking_date TEXT NOT NULL,
            booking_status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            phone TEXT,
            password_hash TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            token TEXT,
            token_expiry TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Analytics
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics (
            analytics_id INTEGER PRIMARY KEY AUTOINCREMENT,
            analytics_date TEXT UNIQUE,
            total_entries INTEGER DEFAULT 0,
            total_exits INTEGER DEFAULT 0,
            occupancy_rate REAL DEFAULT 0
        )
    """)

    # Insert default admin
    admin_hash = hash_password("admin123")
    cursor.execute("""
        INSERT OR IGNORE INTO users (full_name, email, phone, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    """, ("System Admin", "admin@smartparking.com", "9999999999", admin_hash, "admin"))

    # Insert default user
    user_hash = hash_password("user123")
    cursor.execute("""
        INSERT OR IGNORE INTO users (full_name, email, phone, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    """, ("Demo User", "user@demo.com", "8888888888", user_hash, "user"))

    # Initialize 10 parking slots
    for i in range(1, 11):
        cursor.execute("INSERT OR IGNORE INTO parking_slots (slot_number, status) VALUES (?, ?)",
                      (f"A{i:02d}", "available"))

    conn.commit()
    conn.close()

# ==================== AUTH ROUTES ====================

@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    full_name = data.get("full_name")
    email = data.get("email")
    phone = data.get("phone")
    password = data.get("password")

    if not all([full_name, email, password]):
        return jsonify({"error": "All fields required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "Email already registered"}), 409

    password_hash = hash_password(password)
    cursor.execute("""
        INSERT INTO users (full_name, email, phone, password_hash, role)
        VALUES (?, ?, ?, ?, 'user')
    """, (full_name, email, phone, password_hash))

    conn.commit()
    conn.close()
    return jsonify({"message": "Registration successful"}), 201

@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user or user["password_hash"] != hash_password(password):
        conn.close()
        return jsonify({"error": "Invalid email or password"}), 401

    token = generate_token()
    token_expiry = datetime.now() + timedelta(days=7)

    cursor.execute("""
        UPDATE users SET token = ?, token_expiry = ? WHERE user_id = ?
    """, (token, token_expiry, user["user_id"]))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"]
        }
    })

@app.route("/api/auth/me", methods=["GET"])
def get_current_user():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "No token provided"}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE token = ? AND token_expiry > ?", 
                  (token, datetime.now()))
    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({"error": "Invalid or expired token"}), 401

    return jsonify({
        "user_id": user["user_id"],
        "full_name": user["full_name"],
        "email": user["email"],
        "phone": user["phone"],
        "role": user["role"]
    })

@app.route("/api/auth/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")
    new_password = data.get("new_password")

    if not email or not new_password:
        return jsonify({"error": "Email and new password required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT user_id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return jsonify({"error": "Email not found"}), 404

    password_hash = hash_password(new_password)
    cursor.execute("UPDATE users SET password_hash = ? WHERE user_id = ?",
                    (password_hash, user["user_id"]))

    conn.commit()
    conn.close()
    return jsonify({"message": "Password reset successful"})

@app.route("/api/auth/logout", methods=["POST"])
def logout():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET token = NULL, token_expiry = NULL WHERE token = ?", (token,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Logout successful"})

# ==================== ADMIN ROUTES ====================

@app.route("/api/admin/users", methods=["GET"])
def get_all_users():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT user_id, full_name, email, phone, role, created_at 
        FROM users ORDER BY created_at DESC
    """)
    users = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(users)

@app.route("/api/admin/bookings/pending", methods=["GET"])
def get_pending_bookings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM bookings WHERE booking_status = 'pending' ORDER BY created_at DESC
    """)
    bookings = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(bookings)

@app.route("/api/admin/bookings/<int:booking_id>/approve", methods=["PUT"])
def approve_booking(booking_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT slot_number FROM bookings WHERE booking_id = ?", (booking_id,))
    booking = cursor.fetchone()

    if not booking:
        conn.close()
        return jsonify({"error": "Booking not found"}), 404

    cursor.execute("UPDATE bookings SET booking_status = 'active' WHERE booking_id = ?", (booking_id,))
    cursor.execute("UPDATE parking_slots SET status = 'reserved' WHERE slot_number = ?",
                  (booking["slot_number"],))

    conn.commit()
    conn.close()
    return jsonify({"message": "Booking approved"})

@app.route("/api/admin/bookings/<int:booking_id>/reject", methods=["PUT"])
def reject_booking(booking_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT slot_number FROM bookings WHERE booking_id = ?", (booking_id,))
    booking = cursor.fetchone()

    cursor.execute("UPDATE bookings SET booking_status = 'rejected' WHERE booking_id = ?", (booking_id,))

    if booking:
        cursor.execute("UPDATE parking_slots SET status = 'available' WHERE slot_number = ?",
                      (booking["slot_number"],))

    conn.commit()
    conn.close()
    return jsonify({"message": "Booking rejected"})

@app.route("/api/admin/stats", methods=["GET"])
def get_admin_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM users")
    total_users = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM users WHERE role = 'user'")
    total_customers = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM bookings")
    total_bookings = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM bookings WHERE booking_status = 'pending'")
    pending_bookings = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM vehicles WHERE status = 'active'")
    active_vehicles = cursor.fetchone()["total"]

    conn.close()

    return jsonify({
        "total_users": total_users,
        "total_customers": total_customers,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "active_vehicles": active_vehicles
    })

# ==================== EXISTING ROUTES ====================

@app.route("/")
def home():
    return jsonify({
        "message": "Smart Parking API is running!",
        "status": "online",
        "endpoints": [
            "/api/auth/register",
            "/api/auth/login",
            "/api/auth/me",
            "/api/auth/forgot-password",
            "/api/dashboard/stats",
            "/api/admin/stats",
            "/api/admin/users",
            "/api/admin/bookings/pending",
            "/api/slots",
            "/api/vehicles",
            "/api/bookings",
            "/api/analytics"
        ]
    })

@app.route("/api/dashboard/stats", methods=["GET"])
def get_dashboard_stats():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) as total FROM parking_slots")
    total_slots = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as count FROM parking_slots WHERE status='available'")
    available = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM parking_slots WHERE status='occupied'")
    occupied = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM parking_slots WHERE status='reserved'")
    reserved = cursor.fetchone()["count"]

    today = datetime.now().strftime("%Y-%m-%d")
    cursor.execute("SELECT COUNT(*) as count FROM vehicles WHERE DATE(entry_time) = ?", (today,))
    entered_today = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM vehicles WHERE DATE(exit_time) = ?", (today,))
    exited_today = cursor.fetchone()["count"]

    cursor.execute("SELECT COUNT(*) as count FROM vehicles WHERE status='active'")
    current_parked = cursor.fetchone()["count"]

    occupancy_pct = round((occupied / total_slots) * 100, 1) if total_slots > 0 else 0

    conn.close()

    return jsonify({
        "total_slots": total_slots,
        "available_slots": available,
        "occupied_slots": occupied,
        "reserved_slots": reserved,
        "vehicles_entered_today": entered_today,
        "vehicles_exited_today": exited_today,
        "current_vehicles_parked": current_parked,
        "occupancy_percentage": occupancy_pct
    })

@app.route("/api/slots", methods=["GET"])
def get_slots():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM parking_slots ORDER BY slot_number")
    slots = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(slots)

@app.route("/api/slots/<int:slot_id>", methods=["PUT"])
def update_slot(slot_id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE parking_slots SET status = ? WHERE slot_id = ?",
                  (data.get("status", "available"), slot_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Slot updated"})

@app.route("/api/vehicles", methods=["GET"])
def get_vehicles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles ORDER BY entry_time DESC")
    vehicles = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(vehicles)

@app.route("/api/vehicles/active", methods=["GET"])
def get_active_vehicles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE status='active' ORDER BY entry_time DESC")
    vehicles = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(vehicles)

@app.route("/api/vehicles/history", methods=["GET"])
def get_vehicle_history():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE status='exited' ORDER BY exit_time DESC")
    vehicles = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(vehicles)

@app.route("/api/vehicles/search", methods=["GET"])
def search_vehicles():
    query = request.args.get("q", "")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vehicles WHERE vehicle_number LIKE ? ORDER BY entry_time DESC",
                  (f"%{query}%",))
    vehicles = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(vehicles)

@app.route("/api/vehicles/entry", methods=["POST"])
def vehicle_entry():
    data = request.get_json()
    vehicle_number = data.get("vehicle_number")
    slot_number = data.get("slot_number")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT status FROM parking_slots WHERE slot_number = ?", (slot_number,))
    slot = cursor.fetchone()

    if not slot or slot["status"] != "available":
        conn.close()
        return jsonify({"error": "Slot not available"}), 400

    cursor.execute("INSERT INTO vehicles (vehicle_number, slot_number, status) VALUES (?, ?, 'active')",
                  (vehicle_number, slot_number))

    cursor.execute("UPDATE parking_slots SET status = 'occupied' WHERE slot_number = ?", (slot_number,))

    conn.commit()
    conn.close()

    return jsonify({"message": "Vehicle entry recorded", "slot": slot_number})

@app.route("/api/vehicles/exit", methods=["POST"])
def vehicle_exit():
    data = request.get_json()
    vehicle_number = data.get("vehicle_number")

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM vehicles WHERE vehicle_number = ? AND status='active'", (vehicle_number,))
    vehicle = cursor.fetchone()

    if not vehicle:
        conn.close()
        return jsonify({"error": "Vehicle not found"}), 404

    exit_time = datetime.now()
    entry_time = datetime.fromisoformat(vehicle["entry_time"].replace("Z", "+00:00"))
    duration = int((exit_time - entry_time).total_seconds() / 60)

    cursor.execute("""
        UPDATE vehicles SET status='exited', exit_time=?, parking_duration=?
        WHERE vehicle_id = ?
    """, (exit_time, duration, vehicle["vehicle_id"]))

    cursor.execute("UPDATE parking_slots SET status='available' WHERE slot_number = ?",
                  (vehicle["slot_number"],))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Vehicle exit processed",
        "duration": duration,
        "slot": vehicle["slot_number"]
    })

@app.route("/api/bookings", methods=["GET"])
def get_bookings():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings ORDER BY created_at DESC")
    bookings = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(bookings)

@app.route("/api/bookings/my", methods=["GET"])
def get_my_bookings():
    email = request.args.get("email", "")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings WHERE customer_name = ? ORDER BY created_at DESC", (email,))
    bookings = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(bookings)

@app.route("/api/bookings", methods=["POST"])
def create_booking():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO bookings (customer_name, vehicle_number, slot_number, booking_date, booking_status)
        VALUES (?, ?, ?, ?, 'pending')
    """, (data["customer_name"], data["vehicle_number"], data["slot_number"], data["booking_date"]))

    cursor.execute("UPDATE parking_slots SET status='reserved' WHERE slot_number = ?",
                  (data["slot_number"],))

    conn.commit()
    conn.close()
    return jsonify({"message": "Booking request submitted. Waiting for admin approval."})

@app.route("/api/bookings/<int:booking_id>/cancel", methods=["PUT"])
def cancel_booking(booking_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT slot_number FROM bookings WHERE booking_id = ?", (booking_id,))
    booking = cursor.fetchone()

    cursor.execute("UPDATE bookings SET booking_status='cancelled' WHERE booking_id = ?", (booking_id,))

    if booking:
        cursor.execute("UPDATE parking_slots SET status='available' WHERE slot_number = ?",
                      (booking["slot_number"],))

    conn.commit()
    conn.close()
    return jsonify({"message": "Booking cancelled"})

@app.route("/api/bookings/search", methods=["GET"])
def search_bookings():
    query = request.args.get("q", "")
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM bookings 
        WHERE customer_name LIKE ? OR vehicle_number LIKE ? OR slot_number LIKE ?
        ORDER BY created_at DESC
    """, (f"%{query}%", f"%{query}%", f"%{query}%"))
    bookings = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(bookings)

@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT strftime('%H', entry_time) as hour, COUNT(*) as count
        FROM vehicles WHERE DATE(entry_time) = DATE('now')
        GROUP BY hour
    """)
    hourly_entries = [dict(row) for row in cursor.fetchall()]

    cursor.execute("""
        SELECT strftime('%H', exit_time) as hour, COUNT(*) as count
        FROM vehicles WHERE DATE(exit_time) = DATE('now')
        GROUP BY hour
    """)
    hourly_exits = [dict(row) for row in cursor.fetchall()]

    cursor.execute("""
        SELECT status, COUNT(*) as count FROM parking_slots GROUP BY status
    """)
    slot_usage = [dict(row) for row in cursor.fetchall()]

    conn.close()

    return jsonify({
        "hourly_entries": hourly_entries,
        "hourly_exits": hourly_exits,
        "slot_usage": slot_usage
    })

@app.route("/api/simulate/sensors", methods=["POST"])
def simulate_sensors():
    import random
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT slot_id, status, slot_number FROM parking_slots")
    slots = cursor.fetchall()

    for slot in slots:
        if random.random() < 0.3:
            new_status = random.choice(["available", "occupied", "reserved", "maintenance"])
            if slot["status"] == "occupied":
                cursor.execute("""
                    SELECT COUNT(*) as count FROM vehicles WHERE slot_number = ? AND status='active'
                """, (slot["slot_number"],))
                if cursor.fetchone()["count"] > 0:
                    continue
            cursor.execute("UPDATE parking_slots SET status = ? WHERE slot_id = ?",
                          (new_status, slot["slot_id"]))

    conn.commit()
    conn.close()
    return jsonify({"message": "Sensors simulated"})

if __name__ == "__main__":
    init_db()
    print("=" * 60)
    print("  SMART PARKING API SERVER")
    print("=" * 60)
    print("  Home:     http://localhost:5000")
    print("  API:      http://localhost:5000/api/dashboard/stats")
    print("  Login:    http://localhost:5000/api/auth/login")
    print("=" * 60)
    print("  Default Admin: admin@smartparking.com / admin123")
    print("  Default User:  user@demo.com / user123")
    print("=" * 60)
    app.run(debug=True, host="0.0.0.0", port=5000)
