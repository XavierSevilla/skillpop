const { validate, errors: { NotFoundError, ContentError } } = require('skillpop-util')
const { ObjectId, models: { User, Ad } } = require('skillpop-data')

module.exports = function (id, title, description, price) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)
    validate.string(title)
    validate.string.notVoid('title', title)
    validate.string(description)
    validate.string.notVoid('description', description)
    validate.number(price)

    return (async () => {
        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        const ad = await Ad.create({ user: id, title, description, price, date: new Date })

        return ad.id

    })()
}