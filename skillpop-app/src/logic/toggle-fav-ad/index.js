const call = require('../../utils/call')
const { validate, errors: { NotFoundError, CredentialsError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (token, adId) {
    validate.string(token)
    validate.string.notVoid('token', token)

    validate.string(adId)
    validate.string.notVoid('adId', adId)

    return (async () => {
        const res = await call(`${API_URL}/users/favs/${adId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (res.status === 200) return 

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
        
        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}