const { Schema, ObjectId } = require('mongoose')

module.exports = new Schema({
    user: {
        type: ObjectId,
        require: true,
        ref:'User'
    },
    userComment: {
        type: ObjectId,
        require: true
    },
    body: {
        type: String, 
        require: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastAccess: {
        type: Date
    }
})