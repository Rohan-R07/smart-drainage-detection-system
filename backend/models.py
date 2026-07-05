from datetime import datetime
import json
import logging

logger = logging.getLogger(__name__)

def create_default_telemetry():
    """Returns a default dictionary representing a disconnected state."""
    return {
        "timestamp": datetime.now().isoformat(),
        "waterDetected": False,
        "waterSensor": 0,
        "distance": 0.0,
        "waterLevel": 0,
        "status": "CHECKING",
        "pumpRunning": False,
        "relay": False
    }

def validate_and_parse_telemetry(raw_data: str) -> dict:
    """
    Parses raw serial JSON string from the Arduino,
    validates the flat key structure (without mode), and appends a server-side timestamp.
    Raises ValueError or json.JSONDecodeError on invalid structure.
    """
    data = json.loads(raw_data)

    if not isinstance(data, dict):
        raise ValueError("Telemetry payload must be a JSON object")

    # Flat structure keys sent by the new Arduino UNO code:
    required_keys = ["waterDetected", "waterSensor", "distance", "waterLevel", "status", "pumpRunning", "relay"]
    for key in required_keys:
        if key not in data:
            raise ValueError(f"Missing required Arduino field: {key}")

    # Standardize statuses
    status_mapped = str(data["status"]).upper()
    if status_mapped == "BLOCKAGE":
        status_mapped = "BLOCKED"

    # Adapt the flat payload
    sanitized = {
        "timestamp": datetime.now().isoformat(),
        "waterDetected": bool(data["waterDetected"]),
        "waterSensor": int(data["waterSensor"]),
        "distance": float(data["distance"]),
        "waterLevel": int(data["waterLevel"]),
        "status": status_mapped,
        "pumpRunning": bool(data["pumpRunning"]),
        "relay": bool(data["relay"])
    }

    return sanitized
