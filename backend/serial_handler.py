import time
import json
import threading
import queue
import logging
import serial
import serial.tools.list_ports
from datetime import datetime

import state
import socket_manager
from config import Config
from models import validate_and_parse_telemetry, create_default_telemetry

logger = logging.getLogger(__name__)

def check_state_transitions(prev, current):
    """
    Compares the previous telemetry frame with the new one to log specific
    milestone events in the event history.
    """
    # 1. Water Detected transitions
    if current.get("waterDetected") != prev.get("waterDetected"):
        if current.get("waterDetected"):
            state.log_event("Water Detected in drainage system", "warning")
        else:
            state.log_event("Drainage water level cleared", "success")

    # 2. System Status transitions
    if current.get("status") != prev.get("status"):
        status = str(current.get("status", "")).upper()
        if status == "WARNING":
            state.log_event("System alert raised: WARNING state", "warning")
        elif status == "BLOCKED":
            state.log_event("Drain blockage identified: Possible Blockage", "error")
        elif status == "CHECKING":
            state.log_event("System diagnostics initiated: Checking sensors", "info")
        elif status == "NORMAL":
            state.log_event("System status restored: Normal operational parameters", "success")

    # 3. Pump Status transitions
    if current.get("pumpRunning") != prev.get("pumpRunning"):
        if current.get("pumpRunning"):
            state.log_event("Drainage pump activated: Pump Started", "success")
        else:
            state.log_event("Drainage pump deactivated: Pump Stopped", "info")

    # 4. Relay Status transitions
    if current.get("relay") != prev.get("relay"):
        if current.get("relay"):
            state.log_event("Solar pump relay closed: Relay Activated", "info")
        else:
            state.log_event("Solar pump relay opened: Relay Deactivated", "info")



def find_serial_port():
    """
    Looks for the serial port configured in Config.SERIAL_PORT.
    If none is specified, scans the system and returns the first COM port found.
    """
    if Config.SERIAL_PORT:
        return Config.SERIAL_PORT

    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        if "Arduino" in p.description or "Uno" in p.description or "ch340" in p.description.lower():
            logger.info(f"Auto-detected Arduino UNO port: {p.device}")
            return p.device

    if ports:
        logger.info(f"Auto-detected available serial port: {ports[0].device}")
        return ports[0].device

    return None


def run_serial_communication():
    """
    Main loop running in a background thread.
    Manages connections, writes commands from the queue, reads telemetry,
    calculates metrics, and evaluates the heartbeat timeout.
    """
    logger.info("Starting background serial thread...")

    while True:
        port = find_serial_port()

        if not port:
            with state.state_lock:
                state.connection_health["connected"] = False
                state.connection_health["port"] = "No Port Detected"
                state.connection_health["reconnect_attempts"] += 1
            socket_manager.broadcast_connection_health(state.connection_health.copy())
            logger.warning("No serial port detected. Retrying in 2 seconds...")
            time.sleep(2)
            continue

        try:
            logger.info(f"Attempting to connect to serial port: {port} at {Config.BAUD_RATE} baud...")
            
            # Setup serial connection. Timeout set to 1.0s to ensure complete line collection.
            ser = serial.Serial(
                port=port,
                baudrate=Config.BAUD_RATE,
                timeout=1.0,
                write_timeout=0.5
            )

            # Connected successfully!
            with state.state_lock:
                state.connection_health["connected"] = True
                state.connection_health["port"] = port
                state.connection_health["baud_rate"] = Config.BAUD_RATE
                state.connection_health["reconnect_attempts"] = 0
            
            state.log_event(f"Arduino Connected on port {port}", "success")
            socket_manager.broadcast_connection_health(state.connection_health.copy())
            logger.info(f"Connected to Arduino on {port}")

            # Heartbeat watchdog begins inactive (None) until first valid telemetry packet is processed
            last_packet_time = None
            ser.reset_input_buffer()
            ser.reset_output_buffer()

            # Active communication sub-loop
            while ser.is_open:
                # 1. Heartbeat Check (Only runs after the first valid packet is parsed)
                current_time = time.time()
                if last_packet_time is not None:
                    time_elapsed = current_time - last_packet_time
                    logger.info(f"[DEBUG LOG] Heartbeat check: {time_elapsed:.3f}s since last valid packet")
                    if time_elapsed > Config.HEARTBEAT_TIMEOUT:
                        logger.error(f"Heartbeat timeout! No data received from Arduino for 3 seconds on {port}.")
                        state.log_event(f"Arduino Disconnected from port {port} (Heartbeat Timeout)", "error")
                        break

                # 2. Write Outbound Commands from the Queue
                if not state.command_queue.empty():
                    try:
                        cmd_payload = state.command_queue.get_nowait()
                        cmd_str = str(cmd_payload.get("command", "")).strip() + "\n"
                        
                        with state.state_lock:
                            state.connection_health["last_successful_command"] = cmd_payload.get("command")
                            state.connection_health["last_command_status"] = "PENDING"
                        
                        ser.write(cmd_str.encode('utf-8'))
                        ser.flush()
                        
                        with state.state_lock:
                            state.connection_health["last_command_status"] = "SUCCESS"
                        
                        logger.info(f"Wrote command to serial: {cmd_str.strip()}")
                        state.command_queue.task_done()
                    except queue.Empty:
                        pass
                    except Exception as ex:
                        with state.state_lock:
                            state.connection_health["last_command_status"] = "FAILED"
                        logger.error(f"Failed to write command to serial: {ex}")

                # 3. Read Inbound Telemetry Line
                try:
                    line = ser.readline()
                except serial.SerialException as read_ex:
                    logger.error(f"Serial read error: {read_ex}")
                    state.log_event(f"Arduino Disconnected from port {port} (Read Error)", "error")
                    break

                if line:
                    logger.info(f"[DEBUG LOG] Raw bytes received: {line}")
                    try:
                        decoded_line = line.decode('utf-8').strip()
                        logger.info(f"[DEBUG LOG] Decoded string: '{decoded_line}'")
                        
                        # Handle empty lines from read timeouts or carriage returns
                        if not decoded_line:
                            continue

                        # Parse and validate the flat telemetry frame
                        new_telemetry = validate_and_parse_telemetry(decoded_line)
                        logger.info(f"[DEBUG LOG] Parsed JSON / Validation success: {new_telemetry}")
                        logger.info(f"[DEBUG LOG] Timestamp appended: {new_telemetry['timestamp']}")
                        
                        # Process transition logs and update structures
                        with state.state_lock:
                            prev_telemetry = state.latest_state
                            state.latest_state = new_telemetry
                            state.telemetry_history.append(new_telemetry)
                            
                            # Update connection stats
                            state.connection_health["packets_received"] += 1
                            state.connection_health["last_packet_received"] = new_telemetry["timestamp"]
                            
                        # Evaluate transition changes
                        check_state_transitions(prev_telemetry, new_telemetry)
                        
                        # Update heartbeat timer clock
                        last_packet_time = time.time()
                        logger.info(f"[DEBUG LOG] Heartbeat update. Watchdog active. Last packet time: {last_packet_time}")
                        
                        # Broadcast telemetry to WebSockets immediately
                        socket_manager.broadcast_telemetry(state.get_current_status_payload())

                    except (json.JSONDecodeError, ValueError) as parse_ex:
                        logger.error(f"[DEBUG LOG] Validation failure on raw line: '{line}'. Error: {parse_ex}")
                        with state.state_lock:
                            state.connection_health["malformed_packets"] += 1
                            state.connection_health["packets_dropped"] += 1
                        socket_manager.broadcast_connection_health(state.connection_health.copy())

                # Small sleep to prevent CPU hogging
                time.sleep(0.01)

            # Close serial handle on breakout
            ser.close()

        except Exception as ex:
            logger.error(f"Error in serial port handler on {port}: {ex}")
            with state.state_lock:
                state.connection_health["reconnect_attempts"] += 1
                state.connection_health["connected"] = False
            socket_manager.broadcast_connection_health(state.connection_health.copy())
        
        # Mark disconnected on connection failure or drop, and delay retry
        with state.state_lock:
            state.connection_health["connected"] = False
        socket_manager.broadcast_connection_health(state.connection_health.copy())
        time.sleep(2)


def start_serial_thread():
    """Spawns the daemonized serial background thread."""
    thread = threading.Thread(target=run_serial_communication, daemon=True)
    thread.start()
    return thread
