const { model } = require('mongoose')
const { user, comment, ad, chat, message } = require('./schemas')

module.exports = {
    User: model('User', user),
    Comment: model('Comment', comment),
    Chat: model('Chat', chat),
    Message: model('Message', message),
    Ad: model('Ad', ad)
}