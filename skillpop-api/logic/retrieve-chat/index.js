
const { ObjectId, models: { Chat, User } } = require('skillpop-data')
const { validate, errors: { ContentError, NotFoundError } } = require('skillpop-util')


module.exports = function(id, chatId) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    validate.string(chatId)
    validate.string.notVoid('chatId', chatId)
    if (!ObjectId.isValid(chatId)) throw new ContentError(`${chatId} is not a valid id`)

    return (async() => {
        const user = await User.findById(id)
        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        const chat = await Chat.findById(chatId, { __v: 0 }).lean()
        if (!chat) throw new NotFoundError(`chat with id ${chatId} not found`)

        chat.id = chat._id.toString()
        delete chat._id

        const idPublic = chat.users.find(user => user != id)
        const userPublic = await User.findById(idPublic)
        chat.idPublic = idPublic
        chat.userPublic = userPublic

        chat.messages.forEach(message => {
            message.id = message._id.toString()
            delete message._id
            message.idPublic = idPublic
            message.namePublic = userPublic.name
        })

        return chat.messages

    })()
}
