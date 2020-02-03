const { validate, errors: { CredentialsError } } = require('skillpop-util')
const { models: { User } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
module.exports = function (email, password) {
    validate.string(email)
    validate.string.notVoid('e-mail', email)
    validate.email(email)
    validate.string(password)
    validate.string.notVoid('password', password)
    debugger

    return (async () => {
        const user = await User.findOne({ email })

        if (!user) throw new CredentialsError('wrong credentials')

        const valid = await bcrypt.compare(password, user.password)

        if (!valid) throw new CredentialsError('wrong credentials')

        user.lastAccess = new Date

        await user.save()

        return user.id
    })()
}
