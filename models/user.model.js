const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    mail: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
    phNo: { type: String, required: true, unique: true },
    about: { type: String, required: true },
    img: { type: String, default: '' },
    createAt: { type: Date, default: Date.now() },
    status: { type: String, default: 'Hey there! I am using the app.' }, // user status message
    chats: [
        {
            chat_id: { type: Schema.Types.ObjectId, ref: 'Chat' },  // Reference to Chat
            is_muted: { type: Boolean, default: false },
            mute_until: { type: Date, default: null },  // If muted, until when
            is_archived: { type: Boolean, default: false }, // Archiving functionality
            last_message: { type: String },  // Store last message preview
            last_message_time: { type: Date }  // Store the timestamp of the last message
        }
    ],
    created_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;