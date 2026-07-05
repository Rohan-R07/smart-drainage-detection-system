import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Serial configuration
    # Can be hardcoded or set in environmental variables (e.g. COM3 or /dev/ttyACM0).
    # If set to None, the serial handler will attempt auto-detection.
    SERIAL_PORT = os.environ.get('SERIAL_PORT', None)
    BAUD_RATE = int(os.environ.get('BAUD_RATE', 9600))

    # Heartbeat timeout (seconds)
    HEARTBEAT_TIMEOUT = float(os.environ.get('HEARTBEAT_TIMEOUT', 3.0))

    # Flask settings
    FLASK_HOST = os.environ.get('FLASK_HOST', '0.0.0.0')
    FLASK_PORT = int(os.environ.get('FLASK_PORT', 5000))
    DEBUG = os.environ.get('FLASK_DEBUG', 'False').lower() in ('true', '1', 't')

    # WebSocket CORS settings
    CORS_ALLOWED_ORIGINS = [origin.strip() for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '*').split(',')]
