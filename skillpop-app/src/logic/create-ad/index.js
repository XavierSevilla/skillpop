const call = require('../../utils/call')
const { validate, errors: { NotFoundError, CredentialsError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (token, title, description, price) {
    validate.string(token)
    validate.string.notVoid('token', token)

    validate.string(title)
    validate.string.notVoid('title', title)

    validate.string(description)
    validate.string.notVoid('description', description)

    validate.number(price)

    return (async () => {
        const res = await call(`${API_URL}/ads`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, description, price })
        })

        if (res.status === 201) return JSON.parse(res.body).id

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
        
        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}