require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const createAd = require('.')
const { random } = Math
const { errors: { ContentError } } = require('skillpop-util')
const { database, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - create ads', () => {
    before(() => database.connect(TEST_DB_URL))

    let id, name, surname, city, address, email, password, title, description, price
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
    })

    it('should succeed on correct user and ad data', async () => {
        const adId = await createAd(id, title, description, price)

        expect(adId).to.exist
        expect(adId).to.be.a('string')
        expect(adId).to.have.length.greaterThan(0)

        const ad = await Ad.findById(adId)

        expect(ad).to.exist
        expect(ad.user.toString()).to.equal(id)
        expect(ad.title).to.equal(title)
        expect(ad.description).to.equal(description)
        expect(ad.price).to.equal(price)
        expect(ad.date).to.exist
        expect(ad.date).to.be.instanceOf(Date)
    })

    describe('when user not exists', () => {
        it('should fail on not existing user', async () => {
            const id = '012345678901234567890123'
            try {
                await createAd(id, title, description, price)

                throw Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist

                expect(error.message).to.exist
                expect(typeof error.message).to.equal('string')
                expect(error.message.length).to.be.greaterThan(0)
                expect(error.message).to.equal(`user with id ${id} not found`)
            }
        })
    })

    it('should fail on incorrect id, title, description or price type and content', () => {
        expect(() => createAd(1)).to.throw(TypeError, '1 is not a string')
        expect(() => createAd(true)).to.throw(TypeError, 'true is not a string')
        expect(() => createAd([])).to.throw(TypeError, ' is not a string')
        expect(() => createAd({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createAd(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createAd(null)).to.throw(TypeError, 'null is not a string')

        expect(() => createAd('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => createAd(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => createAd(id, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => createAd(id, true)).to.throw(TypeError, 'true is not a string')
        expect(() => createAd(id, [])).to.throw(TypeError, ' is not a string')
        expect(() => createAd(id, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createAd(id, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createAd(id, null)).to.throw(TypeError, 'null is not a string')

        expect(() => createAd(id, '')).to.throw(ContentError, 'title is empty or blank')
        expect(() => createAd(id, ' \t\r')).to.throw(ContentError, 'title is empty or blank')

        expect(() => createAd(id, title, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => createAd(id, title, true)).to.throw(TypeError, 'true is not a string')
        expect(() => createAd(id, title, [])).to.throw(TypeError, ' is not a string')
        expect(() => createAd(id, title, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => createAd(id, title, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => createAd(id, title, null)).to.throw(TypeError, 'null is not a string')

        expect(() => createAd(id, title, '')).to.throw(ContentError, 'description is empty or blank')
        expect(() => createAd(id, title, ' \t\r')).to.throw(ContentError, 'description is empty or blank')

        expect(() => createAd(id, title, description, 'a')).to.throw(TypeError, 'a is not a number')
        expect(() => createAd(id, title, description, true)).to.throw(TypeError, 'true is not a number')
        expect(() => createAd(id, title, description, [])).to.throw(TypeError, ' is not a number')
        expect(() => createAd(id, title, description, {})).to.throw(TypeError, '[object Object] is not a number')
        expect(() => createAd(id, title, description, undefined)).to.throw(TypeError, 'undefined is not a number')
        expect(() => createAd(id, title, description, null)).to.throw(TypeError, 'null is not a number')

    })

    // TODO other cases

    after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
