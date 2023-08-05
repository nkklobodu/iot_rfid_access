// Connect to WiFi network; Print status to serial and LCD
void connectToWiFiLogLcd(const char* ssid, const char* pass) {
  // Print to serial monitor
  Serial.print(F("\nConnecting to "));
  Serial.print(F(ssid));

  // Print to LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("Connecting WiFi"));
  lcd.setCursor(0, 1);

  // Initiate connection
  WiFi.begin(ssid, pass);

  // Keep in loop until connected
  byte dotPos = 0;  // dots to print on LCD
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);

    Serial.print(F("."));
    lcd.setCursor(dotPos, 1);
    lcd.print(".");

    if (dotPos >= 3) {
      dotPos = 0;
      lcd.setCursor(dotPos, 1);
      lcd.print("     ");
    } else dotPos++;
  }

  // Indicate connection success
  // serial
  Serial.print(F("CONNECTED\n"));

  // lcd
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(F("CONNECTED"));
}


// test http connection
void testConnection() {
  http.begin("https://google.com/");
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  Serial.print("HTTP Status Code: ");
  Serial.println(http.GET());
  http.end();

  lcd.clear();
}


