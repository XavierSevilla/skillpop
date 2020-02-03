const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL,  REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const modifyAd = require('.')
const { random } = Math
const { errors: { NotFoundError, ContentError, ConflictError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database,ObjectId, models: { User, Ad } } = require('skillpop-data')
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')
const bcrypt = require('bcryptjs')
const salt = 10

arrayRandom()

describe('logic - modify ad', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let id, id2, name, surname, city, address, email, password, title, description, price
    let hash, token, token2

    let adIds = [],
        titles = [],
        descriptions = [],
        prices = []

    beforeEach(async () => {
        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        city = 'barcelona'
        address = 'calle aribau 15'
        password = `password-${random()}`

        await Promise.all([User.deleteMany(), Ad.deleteMany()])

        hash = await bcrypt.hash(password, salt)

        const user = await User.create({ name, surname, city, address, email, password: hash })

        id = user.id

        token = jwt.sign({ sub: id }, TEST_SECRET)

        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        city = 'barcelona'
        address = 'calle aribau 15'
        password = `password-${random()}`

        const user2 = await User.create({ name, surname, city, address, email, password: hash })

        id2 = user2.id

        token2 = jwt.sign({ sub: id2 }, TEST_SECRET)



        const insertions = []

        for (let i = 0; i < 2; i++) {
            const ad = {
                user: id,
                title: `title-${random()}`,
                // title:'hey guitar teacher',
                description: 'hey guitar teacher',
                // description: `description-${random()}`,
                price: random(),
                date: new Date
            }

            insertions.push(Ad.create(ad).then(ad => adIds.push(ad.id)))

            titles.push(ad.title)
            descriptions.push(ad.description)
            prices.push(ad.price)
        }

        for (let i = 0; i < 2; i++)
            insertions.push(Ad.create({
                user: ObjectId(),
                title: 'hey gu pro',
                description: `description-${random()}`,
                price: random(),
                date: new Date
            }))

        await Promise.all(insertions)
    })

    it('should succeed on correct modify', async () => {
        const newTitle = 'Paco'
        const newDescription = 'Pil'
        const newPrice = 15

        const idAd = adIds.random()

        const ador = await Ad.findById(idAd)
        
        expect(ador).toBeDefined()
        expect(titles).toEqual(expect.arrayContaining([ador.title]))
        expect(descriptions).toEqual(expect.arrayContaining([ador.description]))
        expect(prices).toEqual(expect.arrayContaining([ador.price]))

        const response = await modifyAd(token, idAd, newTitle, newDescription, newPrice)

        expect(response).toBeUndefined()

        const ad = await Ad.findById(idAd)

        expect(ad).toBeDefined()
        expect(ad.title).toEqual(newTitle)
        expect(ad.description).toEqual(newDescription)
        expect(ad.price).toEqual(newPrice)

        adIds = []
        titles = []
        descriptions = []
        prices = []
    })

    describe('when wrong id', () => {
        it('should fail on wrong id', async () => {
            const id = '012345678901234567890123'
            token = jwt.sign({ sub: id }, TEST_SECRET)
            const idAd = adIds.random()
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(token, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()
                expect(error).toBeInstanceOf(NotFoundError)

                const { message } = error
                expect(message).toEqual(`user with id ${id} not found`)
            }
            adIds = []
            titles = []
            descriptions = []
            prices = []
        })
    })

    describe('when wrong id', () => {
        it('should fail on wrong idAd', async () => {
            const idAd = '012345678901234567890123'
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(token, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()
                expect(error).toBeInstanceOf(NotFoundError)

                const { message } = error
                expect(message).toEqual(`ad with id ${idAd} not found`)
            }
            adIds = []
            titles = []
            descriptions = []
            prices = []
        })
    })
    describe('when wrong id', () => {
        it('should fail on user not equal to adId', async () => {
            const idAd = adIds.random()
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15
            try {
                await modifyAd(token2, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()
                expect(error).toBeInstanceOf(Error)

         
                const { message } = error
                expect(message).toEqual(`user with id ${id2} does not correspond to ad with id ${idAd}`)
            }
            adIds = []
            titles = []
            descriptions = []
            prices = []
        })
    })
    describe('when wrong id', () => {
        it('should fail not valid id', async () => {
            const idAd = 'asdasdsad'
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(token, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()
                expect(error).toBeInstanceOf(Error)
                const { message } = error
                expect(message).toEqual(`${idAd} is not a valid id`)
            }
            adIds = []
            titles = []
            descriptions = []
            prices = []
        })
    })

    it('should fail on incorrect name, surname, city or address type and content', () => {
        expect(() => modifyAd(1)).toThrow(TypeError, '1 is not a string')
        expect(() => modifyAd(true)).toThrow(TypeError, 'true is not a string')
        expect(() => modifyAd([])).toThrow(TypeError, ' is not a string')
        expect(() => modifyAd({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => modifyAd(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => modifyAd(null)).toThrow(TypeError, 'null is not a string')

        expect(() => modifyAd('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => modifyAd(' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => modifyAd(id,  1)).toThrow(TypeError, '1 is not a string')
        expect(() => modifyAd(id,  true)).toThrow(TypeError, 'true is not a string')
        expect(() => modifyAd(id,  [])).toThrow(TypeError, ' is not a string')
        expect(() => modifyAd(id,  {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => modifyAd(id,  undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => modifyAd(id,  null)).toThrow(TypeError, 'null is not a string')

        expect(() => modifyAd(id,  '')).toThrow(ContentError, 'idAd is empty or blank')
        expect(() => modifyAd(id,  ' \t\r')).toThrow(ContentError, 'idAd is empty or blank')

        expect(() => modifyAd(id, adIds[0], 1)).toThrow(TypeError, '1 is not a string')
        expect(() => modifyAd(id, adIds[0], true)).toThrow(TypeError, 'true is not a string')
        expect(() => modifyAd(id, adIds[0], [])).toThrow(TypeError, ' is not a string')
        expect(() => modifyAd(id, adIds[0], {})).toThrow(TypeError, '[object Object] is not a string')


        expect(() => modifyAd(id, adIds[0], titles[0], 1)).toThrow(TypeError, '1 is not a string')
        expect(() => modifyAd(id, adIds[0], titles[0], true)).toThrow(TypeError, 'true is not a string')
        expect(() => modifyAd(id, adIds[0], titles[0], [])).toThrow(TypeError, ' is not a string')
        expect(() => modifyAd(id, adIds[0], titles[0], {})).toThrow(TypeError, '[object Object] is not a string')

        expect(() => modifyAd(id, adIds[0], titles[0], descriptions[0], true)).toThrow(TypeError, 'true is not a number')
        expect(() => modifyAd(id, adIds[0], titles[0], descriptions[0], [])).toThrow(TypeError, ' is not a number')
        expect(() => modifyAd(id, adIds[0], titles[0], descriptions[0], {})).toThrow(TypeError, '[object Object] is not a number')



    })

    afterAll(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})