const {  validate, errors: { NotFoundError, ContentError } } = require('skillpop-util')
const {  ObjectId, models: { User, Ad } } = require('skillpop-data')

module.exports = function (id, idPublic) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    validate.string(idPublic)
    validate.string.notVoid('idPublic', idPublic)
    if (!ObjectId.isValid(idPublic)) throw new ContentError(`${idPublic} is not a valid idPublic`)

    return (async () => {
        const userPublic = await User.findById(idPublic)

        if (!userPublic) throw new NotFoundError(`user with idPublic ${idPublic} not found`)

        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        await Ad.updateMany({ user: idPublic }, { $set: { lastAccess: new Date } })

        const ads = await Ad.find({ user: idPublic }, { __v: 0 }).lean()

        ads.forEach(ad => {
            ad.id = ad._id.toString()
            delete ad._id

            ad.user = id
            ad.isFav = user.favs.includes(ObjectId(ad.id))
        })

        return ads

    })()
}