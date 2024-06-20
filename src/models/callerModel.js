const mongoose = require('mongoose');

const callerModel = new mongoose.Schema({
    name: {
        type: String,
        // required: [true, "Name is required"]
    },
    contactNumber: {
        type: Number,  
        // required: [true, "Contact number is required"],
        // unique: true, 
    },
    convoID: {
        type: Number,  
        // required: [true, "Convo ID is required"],
        // unique: true, 
    },
    callerID: {
        type: Number,  
        // required: [true, "Caller ID is required"],
        // unique: true, 
    },
    conversationStore: {
        type: Array,
        default: []
    }
},{timestamps: true})

const Caller = mongoose.model("Caller", callerModel);

module.exports = Caller;