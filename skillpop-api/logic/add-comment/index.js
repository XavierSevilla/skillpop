const { ObjectId, models: { User, Comment } } = require('skillpop-data')
const { validate, errors: { ContentError, NotFoundError } } = require('skillpop-util')


module.exports = function(id, idCommment, body) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    validate.string(idCommment)
    validate.string.notVoid('idCommment', idCommment)
    if (!ObjectId.isValid(idCommment)) throw new ContentError(`${idCommment} is not a valid idCommment`)

    validate.string(body)
    validate.string.notVoid('body', body)


    return (async() => {

        const user = await User.findById(id)
        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        const userComment = await User.findById(idCommment)
        if (!userComment) throw new NotFoundError(`user with id ${idCommment} not found`)

        const comment = new Comment({ user: id, userComment: idCommment, body, date: new Date })
        user.comments.push(comment)
        await user.save()

        return comment.id

    })()
}