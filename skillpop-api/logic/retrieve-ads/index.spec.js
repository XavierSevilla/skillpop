require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveAds = require('.')
const { errors: { NotFoundError, ContentError } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - retrieve ads', () => {
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
        const ads = await retrieveAds(id)

        expect(ads).to.exist
        expect(ads).to.have.lengthOf(10)

        ads.forEach(ad => {
            expect(ad.id).to.exist
            expect(ad.id).to.be.a('string')
            expect(ad.id).to.have.length.greaterThan(0)
            expect(ad.id).be.oneOf(adIds)

            expect(ad.user.toString()).to.equal(id)

            expect(ad.title).to.exist
            expect(ad.title).to.be.a('string')
            expect(ad.title).to.have.length.greaterThan(0)
            expect(ad.title).be.oneOf(titles)
            // expect(ad.title).include(query)

            expect(ad.description).to.exist
            expect(ad.description).to.be.a('string')
            expect(ad.description).to.have.length.greaterThan(0)
            expect(ad.description).be.oneOf(descriptions)

            expect(ad.date).to.exist
            expect(ad.date).to.be.an.instanceOf(Date)

        })
    })

    describe('when wrong id', () => {
        it('should fail on inexisting id', async () => {
            const id = '012345678901234567890123'

            try {
                await retrieveAds(id)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)

                const { message } = error
                expect(message).to.equal(`user with id ${id} not found`)
            }
        })
    })

    it('should fail on incorrect id', () => {
        expect(() => retrieveAds(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveAds(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveAds([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveAds({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveAds(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveAds(null)).to.throw(TypeError, 'null is not a string')

        expect(() => retrieveAds('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveAds(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })


    after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
