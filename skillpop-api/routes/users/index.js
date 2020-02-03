const { Router } = require('express')
const { registerUser, authenticateUser, retrieveUser, modifyUser, retrieveFavs, toggleFavAd, addComment, retrieveComments, saveImageProfile, loadImageProfile } = require('../../logic')
const jwt = require('jsonwebtoken')
const { env: { SECRET } } = process
const tokenVerifier = require('../../helpers/token-verifier')(SECRET)
const bodyParser = require('body-parser')
const { errors: { NotFoundError, ConflictError, CredentialsError } } = require('skillpop-util')
const Busboy = require('busboy')

const jsonBodyParser = bodyParser.json()

const router = Router()

router.post('/', jsonBodyParser, async (req, res) => {
    const { body: { name, surname, city, address, email, password } } = req

    try {
        await registerUser(name, surname, city, address, email, password)
        res.status(201).end()

    } catch (error) {
        const { message } = error

        if (error instanceof ConflictError)
            return res.status(409).json({ message })

        if (error instanceof TypeError || error instanceof TypeErrorContentError)
            return res.status(400).json({ message })

        res.status(500).json({ message })
    }
})

router.post('/auth', jsonBodyParser, (req, res) => {
    const { body: { email, password } } = req

    try {
        authenticateUser(email, password)
            .then(id => {
                const token = jwt.sign({ sub: id }, SECRET, { expiresIn: '1d' })

                res.json({ token })
            })
            .catch(error => {
                const { message } = error

                if (error instanceof CredentialsError)
                    return res.status(401).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/', tokenVerifier, (req, res) => {
    try {
        const { id } = req

        retrieveUser(id)
            .then(user => res.json(user))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch (error) {
        const { message } = error

        res.status(400).json({ message })
    }
})

router.get('/favs', tokenVerifier, jsonBodyParser, (req, res) => {
    try {
        const { id } = req
        retrieveFavs(id)
            .then(ads => res.json(ads))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/:id', (req, res) => {
    try {
        const { params: { id } } = req

        retrieveUser(id)
            .then(user => res.json(user))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch (error) {
        const { message } = error

        res.status(400).json({ message })
    }
})

router.patch('/', tokenVerifier, jsonBodyParser, (req, res) => {
    try {
        const { id, body: { name, surname, city, address } } = req

        modifyUser(id, name, surname, city, address)
            .then(() =>
                res.end()
            )
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.patch('/favs/:adId', tokenVerifier, jsonBodyParser, (req, res) => {
    try {
        const { id, params: { adId } } = req

        toggleFavAd(id, adId)
            .then(isFav => res.json(isFav))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.post('/comment/:idUser', tokenVerifier, jsonBodyParser, (req, res) => {
    try {
        const { id, params: { idUser }, body: { body } } = req

        addComment(idUser, id, body)
            .then(id => res.status(201).json({ id }))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.get('/comment/:id', jsonBodyParser, (req, res) => {
    try {
        const { params: { id } } = req

        retrieveComments(id)
            .then(comments => res.json(comments))
            .catch(error => {
                const { message } = error

                if (error instanceof NotFoundError)
                    return res.status(404).json({ message })

                res.status(500).json({ message })
            })
    } catch ({ message }) {
        res.status(400).json({ message })
    }
})

router.post('/upload/', tokenVerifier, (req, res) => {
    
    const { id } = req
  
    const busboy = new Busboy({ headers: req.headers })

    busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
        filename = 'profile'

        await saveImageProfile(id, file, filename)
        
    })

    busboy.on('finish', () => {
        res.end()
    })

    return req.pipe(busboy)

})

router.get('/load/:id',async (req, res) => {

    const { params: { id } } = req

    const stream = await loadImageProfile(id) 

    res.setHeader('Content-Type', 'image/jpeg')

    return stream.pipe(res)
})


module.exports = router