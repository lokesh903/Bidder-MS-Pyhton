const OpenAI = require('openai');
const { catchAsyncError } = require("../../middlewares/catchAsyncError");
const axios = require('../../utils/axios.js');
// const { getChatGPTResponse, getChatGPTInternalResponse } = require("../AiModel.js");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ticketLookupPrompt = `Your goal is to check if a ticket ID is provided in the response or not. Follow these instructions carefully:

1) Check if the response contains a field named "ticketID".
2) If "ticketID" is present in the response, return the ticket ID.
3) If "ticketID" is not present in the response, return false.

Please ensure that you follow this format for the response:
{
  "ticketID": "<ticketID>"
}

If the ticket ID is found, respond with:
{
  "ticketID": "the actual ticket ID"
}

If the ticket ID is not found, respond with:
{
  "ticketID": false
}
`;

const getTicketID = async (response) =>{
  console.log('response: ',response)
  const result = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [{role: "system", content: ticketLookupPrompt}, {role: "user", content: response}],
  });
  const chatGPTResponse = response.choices[0].message.content;
  console.log("response: " + chatGPTResponse);
}

const statusCodeMapping = {
  1: 'New',
  5: 'Complete',
  7: 'Waiting Customer',
  8: 'In Progress',
  9: 'Waiting Materials',
  10: 'Dispatched',
  11: 'ESCALATED',
  12: 'Waiting Vendor',
  13: 'Waiting Approval',
  15: 'Change Order',
  16: 'Work Complete',
  17: 'On Hold',
  19: 'Customer Note Added',
  20: 'RMM Resolved',
  21: 'HGreg Developers',
  22: 'Waiting on 3rd Party',
  23: 'Assigned to Vendor',
  24: 'Working Live',
  25: 'Unassigned',
  26: 'Scheduled'
};

const ticketLookup = async (ticketID) => {
  // try {
  //   const ticketDets = await axios.get(`/Tickets/${ticketID}`);
  //   console.log("ticketLookupData: " + ticketID);
  //   console.log(ticketDets.data);
    
  //   const { description, status } = ticketDets.data.item;
  //   const statusMessage = statusCodeMapping[status] || 'Unknown Status';
  //   // const responseForClient = await getChatGPTInternalResponse(statusMessage, description);
  //   // console.log("responseForClient: "+responseForClient);
    
  //   return responseForClient;
  // } catch (error) {
  //   console.error(`Error looking up ticket: ${error.message}`);
  //   return `I apologize, but I encountered an error while trying to retrieve the details for ticket ID ${ticketID}. Please try again later or contact our support team for assistance.`;
  // }

  // const ticketInfo = await getTicketInfo(ticketID);
  // const updateMessage = await generateUpdate(ticketInfo);
  // console.log('updateMessage: ',updateMessage);
};






// working

async function getTicketInfo(ticketId) {
  const url = `/Tickets/${ticketId}`;
  const response = await axios.get(url);
  return response.data;
}


// Step 2: Generate update message
// async function generateUpdate(ticketInfo) {

//   const prompt = `
//   You are an IT Helpdesk Dispatcher and Telephone Operator Named Danielle. Your goal is to assist the caller. This is done through a serverless IVR that will perform speech to text and submit it to you via Prompts. The IVR will then read your response and depending on the response will either text to speech it back to the user, send an API request to transfer the call or lookup the ticket and send you the data within it Based on the following ticket information, generate a friendly update message for the user.

//   Title: ${ticketInfo.item.title}
//   Description: ${ticketInfo.item.description}
//   Created on: ${ticketInfo.item.createDate}
//   Due date: ${ticketInfo.item.dueDateTime}
//   Status: ${statusCodeMapping[ticketInfo.item.status] || 'Unknown Status'} 
//   Priority: ${ticketInfo.item.priority}
//   Ticket ID: ${ticketInfo.item.id}

//   Provide the update in a friendly and conversational tone.
//   `;

//   const response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       // response_format: { type: "json_object" },
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         { role: "user", content: prompt }
//     ],
//       // max_tokens: 150
//   });

//   console.log(response.choices[0].message.content)
//   return response.choices[0].message.content;
// }





module.exports = {
  ticketLookup,
  getTicketID,
};