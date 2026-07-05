from flask import Blueprint, jsonify, request
import state

api = Blueprint('api', __name__)

@api.route('/status', methods=['GET'])
def get_status():
    """
    Returns the complete drainage monitoring state:
    latest telemetry, connection health stats, history queue, and event logs.
    """
    return jsonify(state.get_current_status_payload())

@api.route('/control', methods=['POST'])
def control_system():
    """
    Triggers manual control overrides (PUMP_ON, PUMP_OFF, RESET).
    Rejects the request if the Arduino is currently offline.
    """
    if not state.connection_health["connected"]:
        return jsonify({"success": False, "error": "Action blocked: Arduino is disconnected"}), 503

    data = request.json or {}
    command = data.get("command")
    if not command or command not in ["PUMP_ON", "PUMP_OFF", "RESET"]:
        return jsonify({"success": False, "error": "Missing or invalid field: 'command'"}), 400

    # Push command to the thread-safe communication queue
    state.command_queue.put({"command": command})
    
    return jsonify({
        "success": True, 
        "command": command,
        "message": f"Command {command} scheduled for transmission."
    })
