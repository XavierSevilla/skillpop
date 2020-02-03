const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const { random } = Math
const removeAd = require('.')
const { errors: { NotFoundError, ConflictError, ContentError, CredentialsError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

arrayRandom()

describe('logic - delete ads', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let id, name, surname, city, address, email, password
    let hash, token

    let adIds = [],
        titles = [],
        descriptions = [],
        prices = [],
        insertions = []

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
        token = jwt.sign({sub: id}, TEST_SECRET)



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

    it('should succeed on correct user and ad data', async () => {
        const adId = adIds.random()

        const response = await removeAd(token, adId)

        expect(response).toBeUndefined()

        const ad = await Ad.findById(adId)

        expect(ad).toBeNull()
    })

    it('should fail on unexisting user and correct ad data', async () => {
        const id = '012345678901234567890123'
        const token = jwt.sign({ sub: id }, TEST_SECRET)
        const adId = adIds.random()

        try {
            await removeAd(token, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })

    it('should fail on correct user and unexisting ad data', async () => {
        const adId = ObjectId().toString()

        try {
            await removeAd(token, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user does not have ad with id ${adId}`)
        }
    })

    it('should fail on correct user and wrong <ad data', async () => {
        const { _id } = await Ad.findOne({ _id: { $nin: adIds.map(adId => ObjectId(adId)) } })

        const adId = _id.toString()

        try {
            await removeAd(token, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(ConflictError)
            expect(error.message).toBe(`user with id ${id} does not correspond to ad with id ${adId}`)
        }
    })

    afterAll(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
