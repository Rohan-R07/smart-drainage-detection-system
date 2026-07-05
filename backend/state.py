import collections
import queue
import threading
from datetime import datetime
from models import create_default_telemetry

# Thread-safety lock
state_lock = threading.Lock()

# Thread-safe command queue for Flask routes to push commands to the Serial thread
command_queue = queue.Queue()

# In-memory data collections
latest_state = create_default_telemetry()
telemetry_history = collections.deque(maxlen=40)
events = collections.deque(maxlen=20)

# Connection health statistics dictionary
connection_health = {
    "connected": False,
    "port": "Not Connected",
    "baud_rate": 9600,
    "packets_received": 0,
    "packets_dropped": 0,
    "malformed_packets": 0,
    "reconnect_attempts": 0,
    "last_packet_received": None,
    "last_successful_command": None,
    "last_command_status": "NONE"  # NONE, PENDING, SUCCESS, FAILED
}

def log_event(message: str, event_type: str = "info"):
    """
    Appends a formatted event dict to the thread-safe deque.
    We append to the left (appendleft) so the newest event is at index 0.
    """
    event = {
        "timestamp": datetime.now().isoformat(),
        "message": message,
        "type": event_type  # 'info', 'warning', 'error', 'success'
    }
    with state_lock:
        events.appendleft(event)
    return event

def get_current_status_payload():
    """
    Constructs a combined status payload that includes the latest telemetry state,
    connection health statistics, the 40-point history, and the 20 latest events.
    """
    with state_lock:
        return {
            "latest_state": latest_state,
            "connection_health": connection_health.copy(),
            "history": list(telemetry_history),
            "events": list(events)
        }
