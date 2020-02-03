const { validate, errors: { NotFoundError, ContentError } } = require('skillpop-util')
const { ObjectId, models: { User } } = require('skillpop-data')

module.exports = function (id, name, surname, city, address) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    if (name) {
        validate.string(name)
        validate.string.notVoid('name', name)
    }

    if (surname) {
        validate.string(surname)
        validate.string.notVoid('surname', surname)
    }

    if (city) {
        validate.string(city)
        validate.string.notVoid('city', city)
    }

    if (address) {
        validate.string(address)
        validate.string.notVoid('address', address)
    }

    return (async () => {
        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        name && (user.name = name)
        surname && (user.surname = surname)
        city && (user.city = city)
        address && (user.address = address)

        user.lastAccess = new Date

        await user.save()

    })()
}