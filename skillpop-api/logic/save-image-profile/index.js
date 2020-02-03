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


module.exports = function (id, file, filename) {
    validate.string(id)
    validate.string.notVoid('id', id)
    if (!ObjectId.isValid(id)) throw new ContentError(`${id} is not a valid id`)

    return (async () => {
        const user = await User.findById(id)
        if (!user) throw new NotFoundError(`user with id ${id} not found`)
        
        const dir = `./data/users/${id}`
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true}, err => {})
        }
        let saveTo = path.join(__dirname, `../../data/users/${id}/${filename}.png`)
        return file.pipe(fs.createWriteStream(saveTo))            
    })()
}