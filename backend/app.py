import logging
from flask import Flask
from flask_cors import CORS
from config import Config
from routes import api
from socket_manager import init_socketio, socketio
from serial_handler import start_serial_thread

# Setup system-wide logging parameters
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger(__name__)

def create_app():
    """
    Creates and configures the Flask application, registers CORS configurations,
    mounts API blueprints, and initializes the Socket.IO server context.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for traditional REST endpoint routes
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ALLOWED_ORIGINS}})

    # Mount the modular API blueprint
    app.register_blueprint(api, url_prefix='/api')

    # Initialize the WebSocket server manager
    init_socketio(app, Config.CORS_ALLOWED_ORIGINS)

    return app

app = create_app()

if __name__ == '__main__':
    # Initialize the background thread for serial port management
    start_serial_thread()

    logger.info(f"Starting IoT server environment on {Config.FLASK_HOST}:{Config.FLASK_PORT}...")
    
    # Run the server. use_reloader is set to False to prevent the Flask reloader
    # from spawning duplicate daemon threads which corrupts the Serial bus handle.
    socketio.run(
        app,
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=Config.DEBUG,
        use_reloader=False
    )
