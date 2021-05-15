#include <Arduino.h>
#include <SPI.h>
#include <Ethernet.h>
#include <SimpleDHT.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };

// Set the static IP address to use if the DHCP fails to assign
IPAddress ip(_____________);   //REPLACE_WITH_AN_IP (like this 192, 168, 0, 177)
IPAddress myDns(_____________);//REPLACE_WITH_ROUTER_IP (like this 192, 168, 0, 1)

EthernetClient client;

String token = "_____________";       //REPLACE_WITH_YOUR_TOKEN
String serverName = "_____________";  //REPLACE_WITH_YOUR_BAKEND_URL

// Variables to measure the speed
unsigned long beginMicros, endMicros;
unsigned long byteCount = 0;
bool printWebData = true;  // set to false for better speed measurement

unsigned long lastTime = 0;
unsigned long timerDelay = 5000;

// for DHT22,
//      VCC: 5V or 3V
//      GND: GND
//      DATA: 2
int pinDHT11 = 4;
SimpleDHT11 dht11(pinDHT11);

void jsonninator(float temperature, float humidity) {

  String postMessage;

  HTTPClient http;

    http.begin(serverName + token);
    http.addHeader("Content-Type", "application/json");

    const size_t CAPACITY = JSON_OBJECT_SIZE(1);

    StaticJsonDocument<200> doc;

    JsonObject obj = doc.createNestedObject("values");
    obj["temperature"] = temperature;
    obj["humidity"] = humidity;

    serializeJsonPretty(doc, postMessage);

    // serializeJson(doc, Serial);

    int httpCode = http.POST(postMessage);

    Serial.println(postMessage);

    if (httpCode > 0)
    {
      Serial.println();
      Serial.println(httpCode);
      if (httpCode == 201)
      {
        Serial.println("Hooray!");
      }
    }

}

void setup()
{
  // You can use Ethernet.init(pin) to configure the CS pin
  //Ethernet.init(10);  // Most Arduino shields
  //Ethernet.init(5);   // MKR ETH shield
  //Ethernet.init(0);   // Teensy 2.0
  //Ethernet.init(20);  // Teensy++ 2.0
  //Ethernet.init(15);  // ESP8266 with Adafruit Featherwing Ethernet
  //Ethernet.init(33);  // ESP32 with Adafruit Featherwing Ethernet

  // Open serial communications and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }

  // start the Ethernet connection:
  Serial.println("Initialize Ethernet with DHCP:");
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // Check for Ethernet hardware present
    if (Ethernet.hardwareStatus() == EthernetNoHardware) {
      Serial.println("Ethernet shield was not found.  Sorry, can't run without hardware. :(");
      while (true) {
        delay(1); // do nothing, no point running without Ethernet hardware
      }
    }
    if (Ethernet.linkStatus() == LinkOFF) {
      Serial.println("Ethernet cable is not connected.");
    }
    // try to congifure using IP address instead of DHCP:
    Ethernet.begin(mac, ip, myDns);
  } else {
    Serial.print("  DHCP assigned IP ");
    Serial.println(Ethernet.localIP());
  }
  // give the Ethernet shield a second to initialize:
  delay(1000);
  Serial.print("connecting to ");
  Serial.print(server);
  Serial.println("...");

  // if you get a connection, report back via serial:
  if (client.connect(server, 80)) {
    Serial.print("connected to ");
    Serial.println(client.remoteIP());
    client.println();
  } else {
    // if you didn't get a connection to the server:
    Serial.println("connection failed");
  }
  beginMicros = micros();
}

void loop()
{
  // start working...
  Serial.println("=================================");
  Serial.println("Sample DHT11...");

  // read without samples.
  // @remark We use read2 to get a float data, such as 10.1*C
  //    if user doesn't care about the accurate data, use read to get a byte data, such as 10*C.
  float temperature = 0;
  float humidity = 0;
  int err = SimpleDHTErrSuccess;
  if ((err = dht11.read2(&temperature, &humidity, NULL)) != SimpleDHTErrSuccess)
  {
    Serial.print("Read DHT11 failed, err=");
    Serial.println(err);
    delay(2000);
    return;
  }

  Serial.print("Sample OK: ");
  Serial.print((float)temperature);
  Serial.print(" *C, ");
  Serial.print((float)humidity);
  Serial.println(" RH%");

  // DHT11 sampling rate is 0.5HZ.

  if (client.available()>0)
  {
    
    jsonninator(temperature,humidity);

  }
  delay(2500);
}
