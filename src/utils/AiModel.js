const OpenAI = require('openai');
const { Caller } = require('../models');
const { getTicketID } = require('./responseFunctions');
const axios = require('../utils/axios.js');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = 
  "You are an IT Helpdesk Dispatcher and Telephone Operator Named Danielle. Your goal is to assist the caller. This is done through a serverless IVR that will perform speech to text and submit it to you via Prompts." +
  "The IVR will then read your response and depending on the response will either text to speech it back to the user, send an API request to transfer the call or lookup the ticket and send you the data within it. You answer only in JSON. The JSON fields are:" +
  "1) Response-Types:" +
  "a) Ticket Lookup: performed after getting the ticket id from the user." +
  "   - After taking ticket id you will get the Ticket Details on the basis of that Give a friendly update and informative response to the user including the user's name, description of the issue, and the status of the ticket." +
  "b) Ticket Creation: Used when the user has a new issue to report. Also, always use these properties only - title, name, phoneNumber and description. Choose the appropriate title for the ticket according to the issue" +
  "   - Before creating the ticket, always summarize the issue for the user and notify them that you are creating a ticket." +
  "   - After creating ticket if caller say thank you than you will also greet them with thank you"+
  "c) Phone Transfer: JSON in data block must include the user you are trying to reach as 'UserID'" +
  "d) See Availability" +
  "e) Respond to User: JSON in data block should contain Message as a string with the message to the user." +
  "f) Update Ticket" +
  "g) Respond to UserEmergency" +
  "h) Discord Message" +
  "2) Data which will contain the appropriate information. This might be JSON formatted depending on the API required to use to perform the task." +
  "You always respond to the User with their language that they started the conversation with unless they ask you to switch." +
  "You will gather the following information from the user before proceeding with any action other than Respond to User:" +
  "Name" +
  "Phone Number" +
  "Should the User be reporting a new Issue, you need to continue to Respond to User until you have a clear detailed description of the issue. Should there be questions you can ask to help identify the issue you can ask them. Only ask 1 question at a time. Use 'Have you' questions. Do not ask 'Could you' questions. Never ask for passwords or suggest anything that can compromise security. Try to get as many details as possible using 3 questions. After that move onto ticket creation." +
  "You never create a ticket without summarizing the issue for the user and notifying them you are creating a ticket." +
  "The ticket description should be in the same language as the conversation." +
  "If the User says they need to talk to someone urgently, you set Response-Type to 'Respond to UserEmergency', let the user know you are transferring the call." +
  "If the issue involves security or viruses you do not attempt to assist the user. You set 'Response-Type': 'Respond to UserEmergency' let the user know you are transferring the call." +
  "If it is a sales related call, you do not make any suggestions or offer help in choosing products." +
  "If the user asks questions outside the realm of IT, Tech Support, Sales or administration, kindly let them know you cannot assist with that." +
  "For administrative tasks such as billing inquiries, check Paul's availability before transferring the call." +
  "For disgruntled users check Paul's availability before transferring the call." +
  "If a Technician is not available and user wishes to speak to someone else, transfer to Technician Group Extension 110."
;



async function getChatGPTResponse(message, req, res, conversationStore) {
  // console.log("User message to ChatGPT: " + message);
  const sessionId = req.cookies.convo;
  // console.log("SessionId: " + sessionId);

  if (!sessionId || !conversationStore[sessionId]) {
    return res.status(400).send({ error: 'Invalid session or session expired' });
  }

  const chatHistory = conversationStore[sessionId];
  const fullMessage = chatHistory.map(entry => entry.user + ": " + entry.chatGPT).join("\n") + "\nUser Response: " + message;
  // getTicketID(fullMessage);
  console.log("Message to ChatGPT: " + fullMessage);


  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [{role: "system", content: systemPrompt}, {role: "user", content: fullMessage}],
  });

  // For Handling Ticket Lookup 

  const id = await findTicketID(fullMessage);
  if(id !== 'undefined') {
    const ticketDetails = await getTicketInfo(id);
    console.log(JSON.stringify(ticketDetails.item))
    const updatedMessage = `${fullMessage}\n "Ticket Details": ${JSON.stringify(ticketDetails.item)}`;
    console.log("Updated Message to ChatGPT: " + updatedMessage);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [{role: "system", content: systemPrompt}, {role: "user", content: updatedMessage}],
    });

    const chatGPTResponse = response.choices[0].message.content;
    console.log("UpdatedResponse: " + chatGPTResponse);
    // Storing conversation in database
    const caller = await Caller.findOne({ convoID: req.cookies.convo });
      // console.log(caller);
      if (!caller) {
        console.error("Caller not found with convoID: " + req.cookies.convo);
        return next(new ErrorHandler("Something went wrong. Please try again!"));
      }
      caller.conversationStore.push({user: message, chatGPT: chatGPTResponse});
      await caller.save();  
    chatHistory.push({ user: message, chatGPT: chatGPTResponse });
    return chatGPTResponse;
  }

  // get the ticket id ,if not present do'nt excecute below steps
  // get the status of the ticket
  // make a message like ticketId =  -----,status = ---- , now make a good message including staust and ticketId
  // make a call to chat gpt NOTE: don't change the fullmessage intead append present message object into it 
  // now you got the new response 

  const chatGPTResponse = response.choices[0].message.content;
  // console.log("response: " + chatGPTResponse);

  // Store conversation
  const caller = await Caller.findOne({ convoID: req.cookies.convo });
      // console.log(caller);
      if (!caller) {
        console.error("Caller not found with convoID: " + req.cookies.convo);
        return next(new ErrorHandler("Something went wrong. Please try again!"));
      }
      caller.conversationStore.push({user: message, chatGPT: chatGPTResponse});
      await caller.save();
  chatHistory.push({ user: message, chatGPT: chatGPTResponse });
  
  conversationStore[sessionId] = chatHistory;

  return chatGPTResponse;
}


// for finding ticket id
async function findTicketID(userResponse){
  const prompt = `You are a helpful assistant. Your goal is to find the ticket id which is present in the ${userResponse} or not.
  If the ticket id is present than return only that id, without any additional text or formatting. If not, then return "undefined".
  `

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    // response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt }],
    // max_tokens: 150
  });

  // console.log("findTicketID: ",response.choices[0].message.content)
  return response.choices[0].message.content;

}

async function getTicketInfo(ticketId) {
  const url = `/Tickets/${ticketId}`;
  const response = await axios.get(url);
  return response.data;
}

// Continue working in this
// async function getChatGPTInternalResponse(status, description){
//   console.log(`Status: ${status}, Description: ${description}`)
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o",
//     response_format: { type: "json_object" },
//     messages: [{role: "system", content: systemPrompt}, {role: "assistant", content: `Status: ${status}, Description: ${description}`}],
//   });

//   const chatGPTResponse = response.choices[0].message.content;
//   const jsonChatGPTResponse = JSON.parse(chatGPTResponse);
//   console.log("InternalResponse: " + jsonChatGPTResponse);
//   return jsonChatGPTResponse.Data.Message;
// } 

module.exports = {
  getChatGPTResponse,
  // getChatGPTInternalResponse,
};
