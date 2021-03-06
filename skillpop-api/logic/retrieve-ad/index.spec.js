require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveAd = require('.')
const { errors: { NotFoundError, ContentError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

arrayRandom()

describe('logic - retrieve ad', () => {
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

    it('should succeed on correct user and ad ', async () => {
        const idAd = adIds.random()
        const ad = await retrieveAd(id, idAd)

        expect(ad).to.exist

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

    describe('when wrong id', () => {
        it('should fail on inexisting idAd', async () => {
            const idAd = '5de55c50dbb04e0464865933'

            try {
                await retrieveAd(id, idAd)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)

                const { message } = error
                expect(message).to.equal(`ad with id ${idAd} not found`)
            }
        })
    })

    it('should fail on incorrect id', () => {
        expect(() => retrieveAd(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveAd(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveAd([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveAd({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveAd(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveAd(null)).to.throw(TypeError, 'null is not a string')

        expect(() => retrieveAd('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveAd(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => retrieveAd(id, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveAd(id, true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveAd(id, [])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveAd(id, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveAd(id, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveAd(id, null)).to.throw(TypeError, 'null is not a string')

        expect(() => retrieveAd(id, '')).to.throw(ContentError, 'idAd is empty or blank')
        expect(() => retrieveAd(id, ' \t\r')).to.throw(ContentError, 'idAd is empty or blank')
    })


    after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
