const {  validate, errors: { NotFoundError, ContentError} } = require('skillpop-util')
const {  ObjectId, models: { User, Ad } } = require('skillpop-data')

module.exports = function (id, query) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    return (async () => {
        const user = await User.findById(id)

        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        const ads = await Ad.find({ $or:[ { "title" : {$regex : `.*${query}*`}}, {"description" : {$regex : `.*${query}*`}}]}, { __v: 0 }).lean()
        
        if (!ads) return ads

        ads.forEach(ad => {
            ad.id = ad._id.toString()
            delete ad._id

            ad.user = ad.user._id.toString()
            ad.isFav = user.favs.includes(ObjectId(ad.id))
        })
        return ads

    })()
}