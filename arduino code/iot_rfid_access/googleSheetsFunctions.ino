
// log attendance to google sheet
void logToGoogleSheet(char* UID) {
  String url = "https://script.google.com/macros/s/"+
               String(GOOGLE_SCRIPT_ID) +
               "/exec?uid=" +
               String(UID) +
               "&terminal=" + 
               String(TERMINAL_NAME);

  // 
  Serial.println(url);
  Serial.println(F("Connecting to google..."));
  lcd.clear();
  lcd.setCursor(1, 1);
  lcd.print(F("Connecting..."));

  // http.begin(url.c_str());
  http.begin(url);
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  int httpCode = http.GET();
  Serial.print("HTTP Status Code: ");
  Serial.println(httpCode);

  //getting response from google sheet
  String response;

  if (httpCode > 0) {
  String data = http.getString();
    Serial.println("Response: "+data);

    if (!data.isEmpty() && data.length() > 1)
      handleDataFromGoogle(data);

  }
  else {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print(F("ERROR..Try Again"));
  }
  http.end();

  Serial.println("DONE");
  delay(1500);
  updateDisplayDefault = true; // allow display be cleared and display default info

} // end of logToGoogleSheet(char* UID)


// get data response received
void handleDataFromGoogle(String data) {
  int colonIndex = data.indexOf(":");
  String accessType = data.substring(0, colonIndex);
  int nextColonIndex = data.indexOf(":", colonIndex + 1);
  String name = data.substring(colonIndex + 1, nextColonIndex);
  String text = data.substring(nextColonIndex + 1, data.length());

  Serial.println("ColonIndex: " + colonIndex);
  Serial.println("NextColonIndex: "+ nextColonIndex);
  Serial.println("Name: " + name);
  Serial.println("Text: " + text);

  lcd.clear();
  // lcd.setCursor(0, 0);
  // lcd.print("Hi ");
  // lcd.print(name);
  lcd.setCursor(0, 1);
  lcd.print(text);

} // emd of handleDataFromGoogle(String data)
