const {  validate, errors: { NotFoundError, ContentError } } = require('skillpop-util')
const {  ObjectId, models: { User, Ad } } = require('skillpop-data')

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    return (async () => {
        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        await Ad.updateMany({ user: id }, { $set: { lastAccess: new Date } })

        const ads = await Ad.find({ "_id": { $in: user.favs }}, { __v: 0 }).lean()
        // const ads = await Ad.find({ user: id }, { __v: 0 }).lean()

        ads.forEach(ad => {
            ad.id = ad._id.toString()
            delete ad._id
            ad.isFav = user.favs.includes(ObjectId(ad.id))
        })

        return ads

    })()
}