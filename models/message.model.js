const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
    _id: Schema.Types.ObjectId,  // Message ID
    chat_id: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },  // Reference to the chat
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // The user who sent the message
    content: { type: String, required: true },  // Text content of the message
    message_type: { type: String, enum: ['text', 'image', 'video', 'file'], default: 'text' },  // Message type
    media_url: { type: String },  // If it's an image, video, or file, store the URL here
    is_read: { type: Boolean, default: false },  // Read status of the message
    created_at: { type: Date, default: Date.now }
  });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;