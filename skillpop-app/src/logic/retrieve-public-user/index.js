const call = require('../../utils/call')
const { validate, errors: { NotFoundError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (id) {
    validate.string(id)
    validate.string.notVoid('id', id)

    return (async () => {
        const res = await call(`${API_URL}/users/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        })

        if (res.status === 200) {
            const user = JSON.parse(res.body)

            user.lastAccess = new Date(user.lastAccess)

            return user
        }
        
        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}