const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
    _id: Schema.Types.ObjectId,  // Chat ID
    type: { type: String, enum: ['private', 'group'], required: true },  // Either 'private' or 'group'
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],  // Array of user references
    group_name: { type: String },  // Only for group chats
    group_image: { type: String },  // Optional group image (URL)
    admin: { type: Schema.Types.ObjectId, ref: 'User' },  // Admin for group chats
    last_message: { type: String },  // Preview of the last message
    last_message_time: { type: Date },  // Timestamp of the last message
    created_at: { type: Date, default: Date.now }
  });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;