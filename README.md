# Solar Water Pumping System Model for Smart Drainage Monitoring

A production-quality IoT monitoring and actuator control system built to manage and oversee smart drainage structures. It features real-time telemetry streaming from an Arduino UNO, a thread-safe Flask python backend, and a modern Next.js 15 debugging dashboard.

---

## 🛠️ Tech Stack & System Architecture

### 1. Hardware Layer (Arduino UNO)
* **Microcontroller**: Arduino UNO
* **Liquid Sensors**: Analog Water Level/Raindrop sensor (`A0`)
* **Depth/Level Sensor**: Ultrasonic Range Finder (`Trig: Pin 9`, `Echo: Pin 10`)
* **Visual HUD**: 16x2 I2C LCD Display (`0x27`)
* **Status Signaling**: LED Indicator Array (`Green: Pin 2`, `Yellow: Pin 3`, `Red: Pin 4`)
* **Actuator Control**: Active-LOW Solar Pump Relay Switch (`Pin 5`)

### 2. Backend Gateway (Flask)
* **Runtime**: Python 3.10+
* **Framework**: Flask & Flask-CORS
* **Serial Handler**: Background daemon thread utilizing `pySerial` with a 3.0s watchdog heartbeat monitor.
* **WebSocket Server**: `Flask-SocketIO` with cooperative `threading` async mode.

### 3. Frontend Client (Next.js)
* **Framework**: Next.js 15 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS & Vanilla CSS
* **Polling Rate**: 1-second REST HTTP polling with direct CORS bindings to `127.0.0.1` to bypass Windows IPv6 DNS delays.

---

## 🔌 Serial Communication Protocol

The Arduino UNO and Flask backend exchange data over USB Serial at **9600 Baud**.

### 1. Telemetry Frame (Arduino ➔ Flask)
Sent every **500ms** as a single line-terminated (`\n`) JSON string:
```json
{
  "waterDetected": false,
  "waterSensor": 11,
  "distance": 8.50,
  "waterLevel": 18,
  "status": "NORMAL",
  "pumpRunning": false,
  "relay": false
}
```

#### Fields Description:
* `waterDetected` *(boolean)*: True if liquid is touching the water sensor plate.
* `waterSensor` *(int)*: Raw analog sensor value from `A0` (0 - 1023).
* `distance` *(float)*: Computed distance in cm from the ultrasonic sensor.
* `waterLevel` *(int)*: Computed fill percentage (0% to 100%) inside the drain.
* `status` *(string)*: System state (`NORMAL`, `WARNING`, `CHECKING`, `BLOCKAGE`).
* `pumpRunning` *(boolean)*: Active motor status.
* `relay` *(boolean)*: Physical relay contact state.

### 2. Control Commands (Flask ➔ Arduino)
Commands are written directly to the serial buffer as raw, newline-terminated keywords:
* **`PUMP_ON\n`** - Closes the relay (LOW) and turns the drainage pump ON.
* **`PUMP_OFF\n`** - Opens the relay (HIGH) and turns the drainage pump OFF.
* **`RESET\n`** - Resets the blockage timers and stops the pump.

---

## 🛰️ Backend REST API Endpoints

### 1. GET `/api/status`
Returns the current drainage monitoring states, connection parameters, history queues, and events logs.
* **Response:**
  ```json
  {
    "latest_state": {
      "timestamp": "2026-07-05T19:53:01.139914",
      "waterDetected": false,
      "waterSensor": 11,
      "distance": 8.5,
      "waterLevel": 18,
      "status": "NORMAL",
      "pumpRunning": false,
      "relay": false
    },
    "connection_health": {
      "connected": true,
      "port": "COM3",
      "baud_rate": 9600,
      "packets_received": 142,
      "packets_dropped": 0,
      "malformed_packets": 0,
      "reconnect_attempts": 0,
      "last_packet_received": "2026-07-05T19:53:01.139914",
      "last_successful_command": "PUMP_ON",
      "last_command_status": "SUCCESS"
    },
    "history": [...],
    "events": [...]
  }
  ```

### 2. POST `/api/control`
Schedules manual controls to be dispatched to the serial thread queue.
* **Request Body:**
  ```json
  {
    "command": "PUMP_ON" // Options: "PUMP_ON", "PUMP_OFF", "RESET"
  }
  ```
* **Response:**
  ```json
  {
    "success": true,
    "command": "PUMP_ON",
    "message": "Command PUMP_ON scheduled for transmission."
  }
  ```

---

## 🚀 Setting Up and Running

### 1. Arduino Configuration
1. Open the [Arduino IDE](https://www.arduino.cc/en/software).
2. Install the **LiquidCrystal_I2C** library (by Frank de Brabander).
3. Connect your Arduino UNO to your PC.
4. Upload the sketch code to the board.
5. **Important**: Close the Serial Monitor in the Arduino IDE before launching the Flask server. Only one program can lock the COM port at a time.

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the Flask server:
   ```bash
   python app.py
   ```
   *The background thread will scan COM ports automatically, connect, and wait for your Arduino to finish booting up before initiating the heartbeat watchdog.*

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```url
   http://127.0.0.1:3000
   ```

---

## 💡 Troubleshooting Windows DNS Hanging Issues
If the dashboard stays on `"Loading telemetry from Flask backend..."` for more than 5 seconds:
1. Ensure your browser is pointing to `http://127.0.0.1:3000` rather than `http://localhost:3000`.
2. Stop your dev server (`Ctrl + C`) and clear the webpack caching directory using PowerShell:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```
3. Restart using `npm run dev` and perform a hard-refresh (`Ctrl + F5` or `Cmd + Shift + R`).
