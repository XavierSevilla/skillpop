const {  validate, errors: { NotFoundError, ContentError, ConflictError } } = require('skillpop-util')
const {  ObjectId, models: { User, Chat } } = require('skillpop-data')

module.exports = function (id, chatId) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    validate.string(chatId)
    validate.string.notVoid('chat id', chatId)
    if (!ObjectId.isValid(chatId)) throw new ContentError(`${chatId} is not a valid ad id`)

    return (async () => {
        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        const chat = await Chat.findById(chatId)

        if (!chat) throw new NotFoundError(`user does not have Chat with id ${chatId}`)

        const userChat = chat.users.toString().includes(id.toString())

        if (!userChat) throw new ConflictError(`user with id ${id} does not correspond to ad with id ${chatId}`)

        await Chat.deleteOne({ _id: ObjectId(chatId) })

    })()
}