const { Schema, ObjectId } = require('mongoose')
const Message = require('./message')

module.exports =  new Schema({
    users: {
        type: [ObjectId], 
        require: true,
        ref: 'User'
        },
    messages: [Message],
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastAccess: {
        type: Date
    }
})
