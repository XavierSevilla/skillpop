const { validate, errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, models: { Chat, User } } = require('skillpop-data')


module.exports = function(id) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    return (async() => {
        const user = await User.findById(id)
        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        await Chat.updateMany({ "users": { $in: [id] } }, { $set: { lastAccess: new Date } })

        const chats = await Chat.find({ "users": { $in: [id] } }, { __v: 0 }).lean()

            for (let i=0; i < chats.length; i++) {

                let idPublic = chats[i].users[1].toString()

                let userPublic = await User.findById(idPublic)
                chats[i].idPublic = idPublic.toString()
                chats[i].namePublic = userPublic.name
                chats[i].messages.forEach(message => {
                    message.id = message._id.toString()
                    delete message._id
                    message.idPublic = idPublic
                    message.namePublic = userPublic.name
                })               
            }
     
            chats.forEach((chat) => {
                chat.id = chat._id.toString()
                delete chat._id
            })

        return chats

    })()
}