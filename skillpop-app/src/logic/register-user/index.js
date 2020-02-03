const call = require('../../utils/call')
const { validate, errors: { ConflictError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (name, surname, city, address, email, password) {
    validate.string(name)
    validate.string.notVoid('name', name)
    validate.string(surname)
    validate.string.notVoid('surname', surname)
    validate.string(city)
    validate.string.notVoid('city', city)
    validate.string(address)
    validate.string.notVoid('city', address)
    validate.string(email)
    validate.string.notVoid('e-mail', email)
    validate.email(email)
    validate.string(password)
    validate.string.notVoid('password', password)

    return (async () => {
        const res = await call(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, surname, city, address, email, password })
        })

        if (res.status === 201) return
        
        if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}