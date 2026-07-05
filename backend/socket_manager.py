from flask_socketio import SocketIO
import logging

logger = logging.getLogger(__name__)

# Initialize SocketIO instance
socketio = SocketIO()

def init_socketio(app, allowed_origins):
    """
    Initializes Flask-SocketIO with the Flask application
    and registers CORS allowed origins.
    """
    socketio.init_app(app, cors_allowed_origins=allowed_origins)
    logger.info("Socket.IO initialized successfully.")

@socketio.on('connect')
def handle_connect():
    """Triggered when a WebSocket client connects."""
    logger.info("WebSocket Client connected.")

@socketio.on('disconnect')
def handle_disconnect():
    """Triggered when a WebSocket client disconnects."""
    logger.info("WebSocket Client disconnected.")

def broadcast_telemetry(payload):
    """Broadcasts a telemetry state update to all connected Socket.IO clients."""
    socketio.emit("telemetry_update", payload)

def broadcast_connection_health(payload):
    """Broadcasts a connection health state update to all connected Socket.IO clients."""
    socketio.emit("connection_update", payload)
