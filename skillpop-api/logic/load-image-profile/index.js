require('dotenv').config()
const { validate, errors: { NotFoundError, ContentError }  } = require('skillpop-util')
const { ObjectId, models: { User, Ad } } = require('skillpop-data')
const fs = require('fs')
const path = require('path')

/**
* Saves profile image.
* 
* @param {ObjectId} id of user
* @param {Stream} file data of the image
* @param {Sting} filename name of the image
*
* @returns {Promise} - user.  
*/


module.exports = function (id) {
    debugger
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    return (async () => {
        const user = await User.findById(id)
        if (!user) throw new NotFoundError(`user with id ${id} not found`)

        let goTo = path.join(__dirname, `../../data/users/${id}/profile.png`)
        try {
            if (fs.existsSync(goTo)) {
                return fs.createReadStream(goTo)
            } else {
                const defaultImage = path.join(__dirname, `../../data/users/defaultimage/avatar.png`)
                return fs.createReadStream(defaultImage)
            }
        } catch (error) {
        }
       
    })()
}