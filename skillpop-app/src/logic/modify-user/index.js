const call = require('../../utils/call')
const { validate, errors: { ConflictError, NotFoundError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (token, name, surname, city, address) {
    validate.string(token)
    validate.string.notVoid('token', token)

    if (name) {
        validate.string(name)
        validate.string.notVoid('name', name)
    }
    if (surname) {
        validate.string(surname)
        validate.string.notVoid('surname', surname)

    }

    if (city) {
        validate.string(city)
        validate.string.notVoid('city', city)
    }

    if (address) {
        validate.string(address)
        validate.string.notVoid('address', address)
    }

    return (async () => {
        const res = await call(`${API_URL}/users`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, surname, city, address })
        })

        if (res.status === 200) return

        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)
        
        if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}