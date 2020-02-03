const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const createAd = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { database, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

describe('logic - create ads', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let token, id, name, surname, city, address, email, password, title, description, price
    let hash

    beforeEach(async () => {
        name = `name-${random()}`
        surname = `surname-${random()}`     
        city = 'barcelona'
        address = 'calle aribau 15'
        email = `email-${random()}@mail.com`
        password = `password-${random()}`

        await Promise.all([User.deleteMany(), Ad.deleteMany()]) 

        hash = await bcrypt.hash(password, salt)

        const user = await User.create({ name, surname, city, address, email, password: hash })

        id = user.id

        title = `title-${random()}`
        description = `description-${random()}`
        title = `title-${random()}`
        price = random()

        token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on correct user and ad data', async () => {
        const adId = await createAd(token, title, description, price)

        expect(adId).toBeDefined()
        expect(typeof adId).toBe('string')

        const ad = await Ad.findById(adId)

        expect(ad).toBeDefined()
        expect(ad.user.toString()).toBe(id)
        expect(ad.title).toBe(title)
        expect(ad.description).toBe(description)
        expect(ad.price).toBe(price)
        expect(ad.date).toBeDefined()
        expect(ad.date).toBeInstanceOf(Date)
    })

    describe('when user not exists', () => {
        it('should fail on not existing user', async () => {
            const id = '012345678901234567890123'
            const token = jwt.sign({ sub: id }, TEST_SECRET)
            try {
                await createAd(token, title, description, price)

                throw Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()

                expect(error.message).toBeDefined()
                expect(typeof error.message).toBe('string')
                expect(error.message.length).toBeGreaterThan(0)
                expect(error.message).toBe(`user with id ${id} not found`)
            }
        })
    })

    it('should fail on incorrect id, title, description or price type and content', () => {
        expect(() => createAd(1)).toThrow(TypeError, '1 is not a string')
        expect(() => createAd(true)).toThrow(TypeError, 'true is not a string')
        expect(() => createAd([])).toThrow(TypeError, ' is not a string')
        expect(() => createAd({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => createAd(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => createAd(null)).toThrow(TypeError, 'null is not a string')

        expect(() => createAd('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => createAd(' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => createAd(id, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => createAd(id, true)).toThrow(TypeError, 'true is not a string')
        expect(() => createAd(id, [])).toThrow(TypeError, ' is not a string')
        expect(() => createAd(id, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => createAd(id, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => createAd(id, null)).toThrow(TypeError, 'null is not a string')

        expect(() => createAd(id, '')).toThrow(ContentError, 'title is empty or blank')
        expect(() => createAd(id, ' \t\r')).toThrow(ContentError, 'title is empty or blank')

        expect(() => createAd(id, title, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => createAd(id, title, true)).toThrow(TypeError, 'true is not a string')
        expect(() => createAd(id, title, [])).toThrow(TypeError, ' is not a string')
        expect(() => createAd(id, title, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => createAd(id, title, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => createAd(id, title, null)).toThrow(TypeError, 'null is not a string')

        expect(() => createAd(id, title, '')).toThrow(ContentError, 'description is empty or blank')
        expect(() => createAd(id, title, ' \t\r')).toThrow(ContentError, 'description is empty or blank')

        expect(() => createAd(id, title, description, 'a')).toThrow(TypeError, 'a is not a number')
        expect(() => createAd(id, title, description, true)).toThrow(TypeError, 'true is not a number')
        expect(() => createAd(id, title, description, [])).toThrow(TypeError, ' is not a number')
        expect(() => createAd(id, title, description, {})).toThrow(TypeError, '[object Object] is not a number')
        expect(() => createAd(id, title, description, undefined)).toThrow(TypeError, 'undefined is not a number')
        expect(() => createAd(id, title, description, null)).toThrow(TypeError, 'null is not a number')

    })

    // TODO other cases

    afterAll(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})

