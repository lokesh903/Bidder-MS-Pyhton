const { catchAsyncError } = require("../../middlewares/catchAsyncError");
const axios = require('../../utils/axios.js');

const createTicket = async (data) => {
    const ticketDetails = {
      Title: data.title,
      name: data.name,
      PhoneNumber: data.phoneNumber,
      Description: data.description,
      status: 1, // Example status ID
      Priority: 2, // Example priority
      CompanyID: 0, // Example company ID
      QueueID: 5 // Example queue ID
    };
    console.log(ticketDetails)
  
    try {
      const response = await axios.post('/Tickets', ticketDetails);
      console.log("ticket id " + response.data.itemId);
      return response.data.itemId;
    } catch (error) {
      console.error('Error creating ticket:', error.response ? error.response.data : error.message);
      throw new Error('Ticket creation failed');
    }
  };
  
  const ticketCreation = async (data) => {
    try {
      const ticketId = await createTicket(data);
      console.log(data)
      console.log("ticketId "+ticketId)
      return `Your ticket has been created successfully. Your ticket ID is ${ticketId}. Please keep this ID for future reference.`;
    } catch (error) {
      return `Error creating ticket: ${error.message}`;
    }
  };

module.exports = ticketCreation;