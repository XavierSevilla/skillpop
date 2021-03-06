const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const retrieveAd = require('.')
const { random } = Math
const { errors: { NotFoundError, ContentError, CredentialsError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')
const bcrypt = require('bcryptjs')
const salt = 10

arrayRandom()

describe('logic - retrieve ad', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let token, id, name, surname, city, address, email, password
    let hash

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

    it('should succeed on correct user and ad ', async () => {
        const idAd = adIds.random()
        const ad = await retrieveAd(token, idAd)
        expect(ad).toBeDefined()

        expect(ad.id).toBeDefined()
        expect(ad.id).toBeOfType('string')
        expect(adIds).toEqual(expect.arrayContaining([ad.id]))


        expect(ad.user.toString()).toBe(id)

        expect(ad.title).toBeDefined()
        expect(ad.title).toBeOfType('string')
        expect(titles).toEqual(expect.arrayContaining([ad.title]))

        expect(ad.description).toBeDefined()
        expect(ad.description).toBeOfType('string')
        expect(descriptions).toEqual(expect.arrayContaining([ad.description]))

        expect(ad.date).toBeDefined()
        // expect(ad.date).toBeInstanceOf(Date)

    })

    describe('when wrong id', () => {
        it('should fail on inexisting id', async () => {
            const id = '012345678901234567890123'
            token = jwt.sign({ sub: id }, TEST_SECRET)
            const idAd = adIds.random()

            try {
                await retrieveAd(token, idAd)
                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()
                expect(error).toBeInstanceOf(NotFoundError)

                const { message } = error
                expect(message).toBe(`user with id ${id} not found`)
            }
        })

        it('should fail on inexisting idAd', async () => {
            const idAd = '012345678901234567890123'

            try {
                await retrieveAd(token, idAd)
                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()
                expect(error).toBeInstanceOf(NotFoundError)

                const { message } = error
                expect(message).toBe(`ad with id ${idAd} not found`)
            }
        })
    })

    it('should fail on incorrect id', () => {
        expect(() => retrieveAd(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveAd(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveAd([])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveAd({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveAd(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveAd(null)).toThrow(TypeError, 'null is not a string')

        expect(() => retrieveAd('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveAd(' \t\r')).toThrow(ContentError, 'id is empty or blank')

        expect(() => retrieveAd(token, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveAd(token, true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveAd(token, [])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveAd(token, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveAd(token, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveAd(token, null)).toThrow(TypeError, 'null is not a string')
 
        expect(() => retrieveAd(token, '')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveAd(token, ' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })


    afterAll(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
