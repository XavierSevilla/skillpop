const { validate, errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, models: { Chat, User } } = require('skillpop-data')


module.exports = function(userId1, userId2) {
    validate.string(userId1)
    validate.string.notVoid('userId1', userId1)
    if (!ObjectId.isValid(userId1)) throw new ContentError(`${userId1} is not a valid id`)

    validate.string(userId2)
    validate.string.notVoid('userId2', userId2)
    if (!ObjectId.isValid(userId2)) throw new ContentError(`${userId2} is not a valid id`)


    return (async() => {
        const user1 = await User.findById(userId1)
        if (!user1) throw new NotFoundError(`user with id ${userId1} not found`)

        const user2 = await User.findById(userId2)
        if (!user2) throw new NotFoundError(`user with id ${userId2} not found`)
        debugger
        let chat = await Chat.findOne({ $and:[{ "users": { $in: [userId1]}}, { "users": { $in: [userId2]}} ]})

        
        if (chat) {          
            return chat.id          
        }

        chat = await Chat.create({ users: [ObjectId(userId1), ObjectId(userId2)] })

        return chat.id
    })()

}