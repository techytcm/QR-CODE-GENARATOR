from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
import qrcode
import io
import base64
import uuid

app = Flask(__name__)
# In production, use a secure secret key
app.config['SECRET_KEY'] = 'dev-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure CORS to allow requests from the frontend
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000", "http://127.0.0.1:3000"])

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# ==================== Health Check ====================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "success": True,
        "message": "Python Server is running",
        "backend": "python"
    }), 200

# ==================== Auth Routes ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username already exists"}), 400

    hashed_password = generate_password_hash(password, method='scrypt')
    new_user = User(username=username, password=hashed_password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        login_user(new_user)
        return jsonify({"success": True, "message": "Registration successful", "user": {"username": username}}), 201
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        login_user(user)
        return jsonify({"success": True, "message": "Login successful", "user": {"username": username}}), 200
    
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"}), 200

@app.route('/api/auth/status', methods=['GET'])
def auth_status():
    if current_user.is_authenticated:
        return jsonify({"isAuthenticated": True, "user": {"username": current_user.username}}), 200
    return jsonify({"isAuthenticated": False}), 200

# ==================== QR Routes ====================

@app.route('/api/qr/generate', methods=['POST'])
def generate_qr():
    # Optional: Require login for generation? 
    # For now, let's keep it open or check if user wants it protected.
    # The user just said "add user auth", usually implies protecting resources.
    # But usually public generators are fine. Let's leave it public for now but track user if logged in.
    
    data = request.get_json()
    text = data.get('text')
    size = data.get('size', 300)
    color = data.get('color', 'black')
    
    if not text:
        return jsonify({"success": False, "message": "Text is required"}), 400

    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(text)
        qr.make(fit=True)

        fill_color = color if color else 'black'
        img = qr.make_image(fill_color=fill_color, back_color="white")
        
        # Resize to requested size
        img = img.resize((int(size), int(size)))

        buffered = io.BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        data_uri = f"data:image/png;base64,{img_str}"
        
        return jsonify({
            "success": True,
            "data": {
                "id": str(uuid.uuid4()),
                "imageData": data_uri
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    # Run on 5000 to avoid conflict with React/Node default 3000 if running
    app.run(debug=True, port=5000)
