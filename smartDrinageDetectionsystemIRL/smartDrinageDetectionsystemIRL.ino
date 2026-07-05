#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

// ----------------------
// Pin Definitions
// ----------------------
const int waterSensor = A0;
const int trigPin = 9;
const int echoPin = 10;

const int GREEN_LED = 2;
const int YELLOW_LED = 3;
const int RED_LED = 4;

// RELAY
const int RELAY_PIN = 5;

// ----------------------
// Tank Dimensions
// ----------------------
const float EMPTY_DISTANCE = 10.0;   // Distance when drain is empty
const float FULL_DISTANCE  = 2.0;    // Distance when drain is full

// ----------------------
// Variables
// ----------------------
long duration;
float distance;
int waterLevel;

// Control and Modes
bool pumpRunning = false;
int previousWaterLevel = 0;

// Blockage Detection
bool timerStarted = false;
bool blockageDetected = false;
unsigned long warningStartTime = 0;
const unsigned long BLOCKAGE_TIME = 10000;   // 10 seconds

void setup()
{
  Serial.begin(9600);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // LEDs
  pinMode(GREEN_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(RED_LED, OUTPUT);

  // Relay Output
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH); // Keep relay OFF initially (Active Low)
    
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0,0);
  lcd.print("Smart Drainage");
  lcd.setCursor(0,1);
  lcd.print("Initializing");
  delay(2000);
  lcd.clear();
}

void loop()
{
  // -----------------------------
  // 1. Read Serial Commands from Flask
  // -----------------------------
  if (Serial.available() > 0)
  {
    String commandInput = Serial.readStringUntil('\n');
    commandInput.trim();

    // Use indexOf to parse command substrings from Flask JSON payloads
    if (commandInput.indexOf("PUMP_ON") != -1)
    {
      pumpRunning = true;
    }
    else if (commandInput.indexOf("PUMP_OFF") != -1)
    {
      pumpRunning = false;
    }
    else if (commandInput.indexOf("RESET") != -1)
    {
      blockageDetected = false;
      timerStarted = false;
      pumpRunning = false;
    }
  }
  
  int waterValue = analogRead(waterSensor);

  // -----------------------------
  // 2. Ultrasonic Sensor reading
  // -----------------------------
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH, 30000);

  if(duration == 0) {
    distance = FULL_DISTANCE;
    waterLevel = 100;
  } else {
    distance = duration * 0.0343 / 2.0;
    waterLevel = ((EMPTY_DISTANCE - distance) * 100) / (EMPTY_DISTANCE - FULL_DISTANCE);
    waterLevel = constrain(waterLevel, 0, 100);
  }

  // -----------------------------
  // 3. Blockage Detection Logic
  // -----------------------------
  if (waterValue > 150) {
    if (waterLevel >= 90) {
      if (!timerStarted) {
        timerStarted = true;
        blockageDetected = false;
        warningStartTime = millis();
      }
      unsigned long elapsed = millis() - warningStartTime;
      if (elapsed >= BLOCKAGE_TIME) {
        blockageDetected = true;
      }
    } else {
      timerStarted = false;
      blockageDetected = false;
    }
  } else {
    timerStarted = false;
    blockageDetected = false;
  }

  // -----------------------------
  // 4. Output Transmissions (JSON over Serial)
  // -----------------------------
  Serial.print("{");
  Serial.print("\"waterDetected\":");
  Serial.print(waterValue > 150 ? "true" : "false");
  Serial.print(",\"waterSensor\":");
  Serial.print(waterValue);
  Serial.print(",\"distance\":");
  Serial.print(distance);
  Serial.print(",\"waterLevel\":");
  Serial.print(waterLevel);
  Serial.print(",\"status\":\"");
  if(blockageDetected)
      Serial.print("BLOCKAGE");
  else if(waterLevel >= 90)
      Serial.print("CHECKING");
  else if(waterLevel >= 70)
      Serial.print("WARNING");
  else
      Serial.print("NORMAL");
  Serial.print("\",");
  Serial.print("\"pumpRunning\":");
  Serial.print(pumpRunning ? "true" : "false");
  Serial.print(",\"relay\":");
  Serial.print(pumpRunning ? "true" : "false");
  Serial.println("}");

  // -----------------------------
  // 5. LCD Display update
  // -----------------------------
  if (waterValue > 150) {
    lcd.setCursor(0, 0);
    lcd.print("Water:");
    lcd.print(waterLevel);
    lcd.print("%    ");

    lcd.setCursor(0, 1);
    if (blockageDetected) {
      lcd.print("BLOCK DETECTED");
    } else if (waterLevel >= 90) {
      unsigned long remaining = (BLOCKAGE_TIME - (millis() - warningStartTime)) / 1000;
      lcd.print("Checking:");
      lcd.print(remaining);
      lcd.print("s ");
    } else if (waterLevel >= 70) {
      lcd.print("Status:WARN   ");
    } else {
      lcd.print("Status:NORMAL ");
    }
  } else {
    lcd.setCursor(0,0);
    lcd.print("Well & Good :)    ");
    lcd.setCursor(0,1);
    lcd.print("No Water Found      ");
  }

  // -----------------------------
  // 6. Actuator Outputs
  // -----------------------------
  updateLEDs();
  
  // Control relay based on pumpRunning state (LOW = ON, HIGH = OFF)
  if (pumpRunning) {
    digitalWrite(RELAY_PIN, LOW); // Relay Closed (Pump ON)
    lcd.setCursor(0, 1);
    lcd.print("Pump Running  ");
  } else {
    digitalWrite(RELAY_PIN, HIGH); // Relay Open (Pump OFF)
  }

  previousWaterLevel = waterLevel;
  delay(500);
}

void updateLEDs()
{
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, LOW);

  // No water detected
  if (analogRead(waterSensor) <= 150) {
    digitalWrite(GREEN_LED, HIGH);
    return;
  }

  // Blockage detected
  if (blockageDetected) {
    digitalWrite(RED_LED, HIGH);
    return;
  }

  // Checking for blockage
  if (waterLevel >= 90 && !blockageDetected) {
    if ((millis() / 300) % 2 == 0) {
      digitalWrite(YELLOW_LED, HIGH);
    } else {
      digitalWrite(YELLOW_LED, LOW);
    }
    return;
  }

  // Warning
  if (waterLevel >= 70) {
    digitalWrite(YELLOW_LED, HIGH);
    return;
  }

  // Normal
  digitalWrite(GREEN_LED, HIGH);
}
