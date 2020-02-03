const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const { searchAds } = require('../../logic')
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)

const router = Router()

router.get('/', tokenVerifier,  (req, res) => {
    debugger
    try {
        let { id,  query: { q: query } } = req

        if (!query) query = " "
        
        searchAds(id, query)
            .then(ads => {
                res.json(ads)
            })
            .catch(error => {
                const { message } = error

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})


module.exports = router