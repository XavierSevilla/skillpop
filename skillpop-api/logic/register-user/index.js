const { validate, errors: { ConflictError } } = require('skillpop-util')
const { models: { User } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

module.exports = function (name, surname, city, address, email, password) {
    validate.string(name)
    validate.string.notVoid('name', name)
    validate.string(surname)
    validate.string.notVoid('surname', surname)
    validate.string(city)
    validate.string.notVoid('city', city)
    validate.string(address)
    validate.string.notVoid('address', address)
    validate.string(email)
    validate.string.notVoid('e-mail', email)
    validate.email(email)
    validate.string(password)
    validate.string.notVoid('password', password)

    return (async () => {
        const user = await User.findOne({ email })

        if (user) throw new ConflictError(`user with email ${email} already exists`)

        const hash = await bcrypt.hash(password, salt)

        await User.create({ name, surname, city, address, email, password: hash })
        
    })()
}
