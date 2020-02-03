const {  validate, errors: { NotFoundError, ContentError } } = require('skillpop-util')
const {  ObjectId, models: { User, Ad } } = require('skillpop-data')

module.exports = function (idUser, IdAd) {
    validate.string(idUser)
    validate.string.notVoid('idUser', idUser)
    if (!ObjectId.isValid(idUser)) throw new ContentError(`${idUser} is not a valid id`)

    validate.string(IdAd)
    validate.string.notVoid('id', IdAd)
    if (!ObjectId.isValid(IdAd)) throw new ContentError(`${IdAd} is not a valid id`)

    return (async () => {
        const user = await User.findById(idUser)

        if (!user) throw new NotFoundError(`user with id ${idUser} not found`)

        const ad = await Ad.findById(IdAd)

        if (!ad) throw new NotFoundError(`ad with id ${IdAd} not found`)

        const index = user.favs.indexOf(IdAd)

        let isFav

        if (index > -1) {
            user.favs.splice(index, 1)
            isFav = false
        } else {
            user.favs.push(IdAd)
            isFav = true
        }

        user.lastAccess = new Date

        await user.save()

        return isFav

    })()
}