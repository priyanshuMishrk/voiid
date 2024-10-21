const mongoose = require('mongoose');

// Define the schema for call history
const CallHistorySchema = new mongoose.Schema({
  caller: {
    type: mongoose.Schema.Types.ObjectId, // User ID of the caller
    ref: 'User',  // Reference to the User model
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,  // User ID of the receiver
    ref: 'User',  // Reference to the User model
    required: true
  },
  call_type: {
    type: String,  // Type of call (audio or video)
    enum: ['audio', 'video'],  // Allowed values: 'audio' or 'video'
    required: true
  },
  call_status: {
    type: String,  // Status of the call
    enum: ['missed', 'answered', 'declined'],  // Allowed values: 'missed', 'answered', 'declined'
    default: 'missed'  // Default value is 'missed'
  },
  call_duration: {
    type: Number,  // Duration of the call in seconds
    default: 0  // Default value is 0 for calls that did not connect
  },
  created_at: {
    type: Date,  // Timestamp when the call was made
    default: Date.now  // Automatically set the current date and time
  },
  ended_at: {
    type: Date,  // Timestamp when the call ended (if applicable)
  },
  media_url: {
    type: String,  // URL for any recorded media (optional)
  },
  is_recorded: {
    type: Boolean,  // Whether the call was recorded
    default: false  // Default is 'false'
  }
});

// Create the CallHistory model
const CallHistory = mongoose.model('CallHistory', CallHistorySchema);

module.exports = CallHistory;
