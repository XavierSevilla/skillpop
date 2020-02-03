const call = require('../../utils/call')
const { validate, errors: { NotFoundError, CredentialsError } } = require('skillpop-util')
// const { env: { REACT_APP_API_URL: API_URL } } = process
const API_URL = process.env.REACT_APP_API_URL

module.exports = function (token, id) {
    validate.string(token)
    validate.string.notVoid('token', token)
    validate.string(id)
    validate.string.notVoid('id', id)

    return (async () => {
        const res = await call(`${API_URL}/ads/publicid/${id}`, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` }
        })

        if (res.status === 200) {
            const ads = JSON.parse(res.body)

            ads.forEach(ad => {
                ad.date = new Date(ad.date)

                ad.lastAccess = new Date(ad.lastAccess)
            })

            return ads
        }

        if (res.status === 401) throw new CredentialsError(JSON.parse(res.body).message)
        
        if (res.status === 404) throw new NotFoundError(JSON.parse(res.body).message)

        throw new Error(JSON.parse(res.body).message)
    })()
}