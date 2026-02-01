const twilio = require("twilio");

// Replace with your Twilio credentials
const accountSid = "AC73920ef8da2a8ba68320d8f8aab10696";
const authToken = "95d7f66ee0af6278c4862d0c2753e0b9";
const client = twilio(accountSid, authToken);

// Your Twilio sandbox WhatsApp number (from Twilio console)
const FROM_NUMBER = "whatsapp:+14155238886"; // Twilio sandbox number
// Your personal WhatsApp number in international format
const TO_NUMBER = "whatsapp:+916396551799"; 

module.exports = async (message) => {
  try {
    const msg = await client.messages.create({
      from: FROM_NUMBER,
      to: TO_NUMBER,
      body: message
    });
    console.log("WhatsApp message sent, SID:", msg.sid);
  } catch (err) {
    console.error("Failed to send WhatsApp message:", err.message);
  }
};
