require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveFavs = require('.')
const { errors: { NotFoundError, ContentError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

arrayRandom()

describe('logic - retrieve favs', () => {
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

            insertions.push(Ad.create(ad).then(ad => adIds.push(ObjectId(ad.id))))

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
        
        user.favs = adIds

        await user.save()

    })

    it('should succeed on correct user and ad data', async () => {
        const adFavs = await retrieveFavs(id)

        expect(adFavs).to.exist
        expect(adFavs).to.have.lengthOf(10)

        adFavs.forEach(adFav => {
            expect(adFav.id).to.exist
            expect(adFav.id).to.be.a('string')
            expect(adFav.id).to.have.length.greaterThan(0)


            // expect(adFav.id).be.oneOf(adIds)
            // expect(adFav.user.toString()).to.equal(id)

            expect(adFav.title).to.exist
            expect(adFav.title).to.be.a('string')
            expect(adFav.title).to.have.length.greaterThan(0)
            expect(adFav.title).be.oneOf(titles)

            expect(adFav.description).to.exist
            expect(adFav.description).to.be.a('string')
            expect(adFav.description).to.have.length.greaterThan(0)
            expect(adFav.description).be.oneOf(descriptions)

            expect(adFav.date).to.exist
            expect(adFav.date).to.be.an.instanceOf(Date)

        })
    })

    describe('when wrong id', () => {
        it('should fail on inexisting id', async () => {
            const id = '012345678901234567890123'

            try {
                await retrieveFavs(id)

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
        expect(() => retrieveFavs(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveFavs(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveFavs([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveFavs({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveFavs(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveFavs(null)).to.throw(TypeError, 'null is not a string')

        expect(() => retrieveFavs('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveFavs(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })


after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
