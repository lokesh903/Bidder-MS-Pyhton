const twilio = require('twilio');
const { catchAsyncError } = require('../middlewares/catchAsyncError');

exports.incomingCall = catchAsyncError( async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  const callerID = req.body.From;
  const callerName = req.body.CallerName
  console.log("callerID :"+callerID);
  console.log("callerName :"+callerName);
  twiml.redirect({ method: 'POST' }, '/handle-query');
  res.type('text/xml');
  res.send(twiml.toString());
});

exports.timeout = catchAsyncError( async (req, res) => {
  const twiml = new twilio.twiml.VoiceResponse();
  twiml.redirect({ method: 'POST' }, '/handle-query');
  res.type('text/xml');
  res.send(twiml.toString());
});

