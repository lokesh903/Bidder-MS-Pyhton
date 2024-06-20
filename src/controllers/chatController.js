const twilio = require('twilio');
const { getChatGPTResponse } = require('../utils/AiModel.js');
const axios = require('../utils/axios.js');
const {Caller} = require('../models');
const { catchAsyncError } = require('../middlewares/catchAsyncError.js');
const ErrorHandler = require('../utils/errorHandler.js');
const {ticketCreation, ticketLookup} = require('../utils/responseFunctions');

const INITIAL_MESSAGE = 'Hello. I am the A.E.T. voice Assistant named Daniella. How can I assist you today?';
let haveResponse = true;
const conversationStore = {};

exports.handleQuery = catchAsyncError(async (req, res, next) => {
  const callerID = req.body.From;
  const callerName = req.body.CallerName;
  console.log("handleQuerycallerID :" + callerID);
  console.log("handleQuerycallerName :" + callerName);

  let chatResponse;
  if (!req.cookies.convo) {
    const randomNumber = Math.random().toString().substring(2);
    chatResponse = INITIAL_MESSAGE;
    res.cookie('convo', randomNumber, { maxAge: 900000, httpOnly: true });

    // Creating user in database
    const caller = await new Caller({
      convoID: randomNumber,
      callerID: req.body.From,
      contactNumber: req.body.From,
      conversationStore: []
    }).save();

    console.log(randomNumber);
    conversationStore[randomNumber] = [];
    console.log("Initial Message");
    console.log("conversationStore:" + JSON.stringify(conversationStore, null, 2));
  } else {
    if (haveResponse) {
      const userInput = req.body.SpeechResult;
      let chatResponseJSON = await getChatGPTResponse(userInput, req, res, conversationStore);
      chatResponseJSON = JSON.parse(chatResponseJSON);

      console.log("Response-Type: " + chatResponseJSON["Response-Types"]);

      chatResponse = await handleResponse(chatResponseJSON);

      console.log(chatResponseJSON);
      console.log('chatResponse: ' + JSON.stringify(chatResponse));

      // Storing the conversation data in database
      // const caller = await Caller.findOne({ convoID: req.cookies.convo });
      // console.log(caller);
      // if (!caller) {
      //   console.error("Caller not found with convoID: " + req.cookies.convo);
      //   return next(new ErrorHandler("Something went wrong"));
      // }

      // Ensure conversationStore[caller.convoID] is defined
      // const conversationEntries = conversationStore[caller.convoID];
      // console.log(JSON.stringify(conversationStore))
      // console.log("conversationEntries: "+ conversationEntries)
      // if (conversationEntries) {
      //   const validEntries = conversationEntries.filter(entry => entry.user && entry.chatGPT);
      //   caller.conversationStore = validEntries;
      //   await caller.save();
      // } else {
      //   console.error("No conversation entries found for convoID: " + caller.convoID);
      //   return next(new ErrorHandler("No conversation entries found"));
      // }
    }
  }

  console.log("Listening...");
  console.log("conversationStore: " + JSON.stringify(conversationStore, null, 2));

  haveResponse = true;

  const twiml = new twilio.twiml.VoiceResponse();
  const gather = twiml.gather({
    input: 'speech',
    action: '/handle-query',
    enhanced: "true",
    speechModel: "phone_call",
    speechTimeout: "auto",
  });
  gather.say({ voice: 'Polly.Danielle-Neural' }, chatResponse);

  twiml.redirect({ method: 'POST' }, '/timeout');

  res.type('text/xml');
  res.send(twiml.toString());
});

async function handleResponse(response) {
  switch (response["Response-Type"]) {
    case "Respond to User":
      return respondToUser(response.Data.Message);
    case "Ticket Lookup":
      console.log('Ticket Lookup Data:', response?.Data?.ticketID);
      return ticketLookup(response?.Data?.ticketID);
    case "Ticket Creation":
      return await ticketCreation(response.Data);
    case "Phone Transfer":
      return phoneTransfer(response.Data.UserID);
    case "See Availability":
      return seeAvailability(response.Data);
    case "Update Ticket":
      return updateTicket(response.Data);
    case "Respond to UserEmergency":
      return respondToUserEmergency(response.Data.Message);
    case "Discord Message":
      return discordMessage(response.Data.Message);
    default:
      return "Response type not recognized.";
  }
}

function respondToUser(message) {
  return message;
}


function phoneTransfer(userID) {
  return `Transferring call to user ID: ${userID}`;
}

function seeAvailability(data) {
  return `Checking availability: ${JSON.stringify(data)}`;
}

function updateTicket(data) {
  return `Updating ticket: ${JSON.stringify(data)}`;
}

function respondToUserEmergency(message) {
  return `Emergency response: ${message}`;
}

function discordMessage(message) {
  return `Sending Discord message: ${message}`;
}