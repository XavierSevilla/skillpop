require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const removeAd = require('.')
const { errors: { NotFoundError, ConflictError, ContentError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

arrayRandom()

describe('logic - delete ads', () => {
    before(() => database.connect(TEST_DB_URL))

    let id, name, surname, city, address, email, password
    let hash

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

        adIds = []
        titles = []
        descriptions = []
        prices = []

        const insertions = []

        for (let i = 0; i < 10; i++) {
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

        for (let i = 0; i < 10; i++)
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

        const response = await removeAd(id, adId)

        expect(response).to.not.exist

        const ad = await Ad.findById(adId)

        expect(ad).to.not.exist
    })

    it('should fail on unexisting user and correct ad data', async () => {
        const id = ObjectId().toString()
        const adId = adIds.random()

        try {
            await removeAd(id, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${id} not found`)
        }
    })

    it('should fail on correct user and unexisting ad data', async () => {
        const adId = ObjectId().toString()

        try {
            await removeAd(id, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user does not have ad with id ${adId}`)
        }
    })

    it('should fail on correct user and wrong <ad data', async () => {
        const { _id } = await Ad.findOne({ _id: { $nin: adIds.map(adId => ObjectId(adId)) } })

        const adId = _id.toString()

        try {
            await removeAd(id, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`user with id ${id} does not correspond to ad with id ${adId}`)
        }
    })
    it('should fail not valid id', async () => {
        const id = '//'
        const adId = adIds.random()
        try {
            await removeAd(id, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${id} is not a valid id`)
        }
    })
    it('should fail not valid id', async () => {
        const adId = '/'

        try {
            await removeAd(id, adId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${adId} is not a valid ad id`)
        }
    })

    after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
