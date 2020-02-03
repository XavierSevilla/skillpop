require('dotenv').config()
const { validate,  errors: { NotFoundError, ContentError }  } = require('skillpop-util')
const { ObjectId, models: { User, Ad } } = require('skillpop-data')
const fs = require('fs')
const path = require('path')

/**
* Load the wish image
* 
* @param {ObjectId} id of the user
* @param {ObjectId} adId id of the adId
* @returns {Promise} - data of image  
*/

module.exports = function (adId) {
    validate.string(adId)
    validate.string.notVoid('wishId', adId)
    if (!ObjectId.isValid(adId)) throw new ContentError(`${adId} is not a valid id`)
    
    return (async () => {      
        const ad = Ad.findById(adId)        
        if (!ad) throw new NotFoundError(`ad with id ${adId} not found`)

        let goTo = path.join(__dirname, `../../data/ads/${adId}/adimage.png`)
                try {
            if (fs.existsSync(goTo)) {
                return fs.createReadStream(goTo)
            } else {
                const defaultImage = path.join(__dirname, `../../data/ads/defaultimage/avatar.png`)
                return fs.createReadStream(defaultImage)
            }
        } catch (error) {
        }

    })()
}