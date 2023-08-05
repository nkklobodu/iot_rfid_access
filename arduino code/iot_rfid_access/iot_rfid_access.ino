// Include libraries
#include <WiFi.h>
#include <SPI.h>
#include <HTTPClient.h>
#include <LiquidCrystal_I2C.h>
#include <MFRC522.h>
#include "config.h"

// Create objects
LiquidCrystal_I2C lcd(0x27, 16, 2); // LCD object
MFRC522 mfrc522(SS_PIN, RST_PIN);   // MFRC object
HTTPClient http;                    // HTTP object

// Variable to store RFID operation status codes
MFRC522::StatusCode status;

// Enums for scanner operation mode
enum Modes {SCAN, LOG};
Modes mode = LOG;
// Modes mode = SCAN;

// Other necessary flags
bool updateDisplayDefault = true;    // flag to cause the display be updated with default info


void setup() {
  Serial.begin(115200); // initialize serial communication with PC
  SPI.begin();          // init SPI bus
  mfrc522.PCD_Init();   // init MFRC522
  lcd.init();           // init LCD display
  lcd.backlight();      // turn on LCD backlight
  lcd.clear();          // clear text on lcd
  delay(500);          // pause code for 0.5 sec

  // connect to WiFi
  if (WiFi.status() != WL_CONNECTED)
    connectToWiFiLogLcd(USER_SSID, USER_PASS);
  
  // test internet connection
  testConnection();
}


void loop() {
  // Ensure wifi is always connected to run
  if (WiFi.status() != WL_CONNECTED) {
    connectToWiFiLogLcd(USER_SSID, USER_PASS);
    testConnection();
  }

  // Update display if needed
if (updateDisplayDefault) {
    lcd.clear();
    if (mode == SCAN) {
      lcd.setCursor(1, 0);
      lcd.print("Check your UID");
    }
    else if (mode == LOG) {
      lcd.setCursor(1, 1);
      lcd.print("Ready to Scan");
    }
    updateDisplayDefault = false;
  }


  // Check if card is present
  if (!mfrc522.PICC_IsNewCardPresent()) 
    return;

  // Select one of the cards
  if (!mfrc522.PICC_ReadCardSerial())
    return;


  // Get card info
  char cardUID[16]; // store the UID in a character array (expected maximum UID length e.g., 16 characters)

  int uidLength = mfrc522.uid.size * 2; // each byte is represented by 2 hexadecimal characters
  for (size_t i = 0; i < mfrc522.uid.size; i++)
    sprintf(&cardUID[i * 2], "%02X", mfrc522.uid.uidByte[i]); // convert byte to hexadecimal and store in card UID

  // Print the card UID to the serial monitor
  Serial.print("CardUID: ");
  Serial.println(cardUID);

  
  // Take decision on card
  if (mode == SCAN) {
    // just display the card UID
    lcd.setCursor(3, 1);
    lcd.print(cardUID);
  }
  else if (mode == LOG) {
    // send the UID to google sheets for processing
    logToGoogleSheet(cardUID);
  }

  mfrc522.PICC_HaltA();       // halt the currently selected PICC (RFID card)
  mfrc522.PCD_StopCrypto1();  // stop encryption on the PCD (MFRC522 reader)

}
