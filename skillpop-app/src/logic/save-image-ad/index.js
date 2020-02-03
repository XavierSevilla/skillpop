require('dotenv').config()
const { validate } = require('skillpop-util')
const API_URL = process.env.REACT_APP_API_URL


module.exports = function (token, idAd, image) {
    validate.string(token)
    validate.string.notVoid('token', token)
    
    validate.string(idAd)
    validate.string.notVoid('idAd', idAd)
    
    let fData = new FormData()
    fData.append('image', image);

    return (async () => {
            const res = await fetch(`${API_URL}/ads/upload/${idAd}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: fData
            })
            if (res.status === 201) return   

    })()
}