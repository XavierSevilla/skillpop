const {  validate, errors: { NotFoundError, ContentError } } = require('skillpop-util')
const {  ObjectId, models: { User, Ad } } = require('skillpop-data')

module.exports = function (id, idAd) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    validate.string(idAd)
    validate.string.notVoid('idAd', idAd)
    if (!ObjectId.isValid(idAd)) throw new ContentError(`${idAd} is not a valid idAd`)

    return (async () => {
        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        const ad = await Ad.findById(idAd).lean()  

        if (!ad) throw new NotFoundError(`ad with id ${idAd} not found`)

        await Ad.updateOne({ _id: idAd }, { $set: { lastAccess: new Date } })

        ad.id = ad._id.toString()
        delete ad._id

        ad.user = ad.user.toString()
        ad.isFav = user.favs.includes(ObjectId(ad.id))

        return ad

    })()
}

// module.exports = function (id, idAd) {
//     validate.string(id)
//     validate.string.notVoid('id', id)
//     if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)
//     validate.string(idAd)
//     validate.string.notVoid('idAd', idAd)
//     if (!ObjectId.isValid(idAd)) throw new ContentError(`${idAd} is not a valid idAd`)

//     return (async () => {
//         const user = await User.findById(id)

//         if (!user) throw new NotFoundError(`user with id ${id} not found`)

//         const ad = await Ad.findOne({ _id: idAd }, { __v: 0 }).lean()

//         if (!ad) throw new NotFoundError(`ad with id ${id} not found`)

//         await Ad.updateOne({ _id: idAd }, { $set: { lastAccess: new Date } })

//         ad.id = ad._id.toString()
//         delete ad._id

//         ad.user = id

//         return ad

//     })()
// }