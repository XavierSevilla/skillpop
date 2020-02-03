const { Schema, ObjectId } = require('mongoose')

module.exports =  new Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
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