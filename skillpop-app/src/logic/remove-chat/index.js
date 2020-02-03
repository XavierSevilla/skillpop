const call = require('../../utils/call')
const { validate, errors: { NotFoundError, CredentialsError, ConflictError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (token, idChat) {
    validate.string(token)
    validate.string.notVoid('token', token)

    validate.string(idChat)
    validate.string.notVoid('idChat', idChat)

    return (async () => {
        const res = await call(`${API_URL}/chats/${idChat}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.status === 200) return

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
        
        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        if (res.status === 409) throw new ConflictError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}