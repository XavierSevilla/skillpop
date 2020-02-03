const {  validate, errors: { NotFoundError, ContentError, ConflictError } } = require('skillpop-util')
const {  ObjectId, models: { User, Ad } } = require('skillpop-data')

module.exports = function (id, adId) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    validate.string(adId)
    validate.string.notVoid('task id', adId)
    if (!ObjectId.isValid(adId)) throw new ContentError(`${adId} is not a valid ad id`)

    return (async () => {
        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        const ad = await Ad.findById(adId)

        if (!ad) throw new NotFoundError(`user does not have ad with id ${adId}`)

        if (ad.user.toString() !== id.toString()) throw new ConflictError(`user with id ${id} does not correspond to ad with id ${adId}`)

        await Ad.deleteOne({ _id: ObjectId(adId) })

    })()
}