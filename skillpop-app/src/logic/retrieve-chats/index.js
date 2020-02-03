const call = require('../../utils/call')
const { validate, errors: { NotFoundError, CredentialsError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (token) {
    validate.string(token)
    validate.string.notVoid('token', token)

    return (async () => {
        const res = await call(`${API_URL}/chats`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.status === 200) {
            const chats = JSON.parse(res.body)

            chats.forEach(chat => {
                chats.date = new Date(chats.date)

                chats.lastAccess = new Date(chats.lastAccess)
            })

            return chats
        }

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
        
        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}