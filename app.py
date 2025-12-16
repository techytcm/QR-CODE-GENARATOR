from flask import Flask, request, jsonify
from flask_cors import CORS
import qrcode
import io
import base64
import uuid
import logging

app = Flask(__name__,
            static_folder='.',
            static_url_path='/',
            template_folder='.')
# In production, use a secure secret key
app.config['SECRET_KEY'] = 'dev-secret-key'

# Configure CORS to allow requests from the frontend
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"])

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== Static File Routes ====================

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/login')
def login_page():
    return app.send_static_file('index.html')

@app.route('/<path:path>')
def static_files(path):
    return app.send_static_file(path)

# ==================== Health Check ====================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "success": True,
        "message": "Python Server is running",
        "backend": "python"
    }), 200

# ==================== QR Routes ====================

@app.route('/api/qr/generate', methods=['POST'])
@login_required
def generate_qr():
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
    # Run on 5000 to avoid conflict with React/Node default 3000 if running
    app.run(debug=True, port=5000)
