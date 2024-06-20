const twilio = require('twilio');

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

module.exports = twilioClient;
