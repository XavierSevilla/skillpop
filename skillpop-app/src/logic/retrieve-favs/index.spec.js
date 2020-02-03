const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const { random } = Math
const retrieveFavs = require('.')
const { errors: { NotFoundError, ContentError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

arrayRandom()

describe('logic - retrieve favs', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let id, name, surname, city, address, email, password
    let hash, token
    let adIds = [],
        titles = [],
        descriptions = [],
        prices = [],

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

            insertions.push(Ad.create(ad).then(ad => adIds.push(ObjectId(ad.id))))

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
        
        user.favs = adIds

        await user.save()

    })

    it('should succeed on correct user and ad data', async () => {
        const adFavs = await retrieveFavs(id)

        expect(adFavs).toBeDefined()
        expect(adFavs).toHaveLength(2)

        adFavs.forEach(adFav => {
            expect(adFav.id).toBeDefined()
            expect(adFav.id).toBeOfType('string')


            // expect(adFav.id).be.oneOf(adIds)
            // expect(adFav.user.toString()).to.equal(id)

            expect(adFav.title).toBeDefined()
            expect(adFav.title).toBeOfType('string')
            expect(adFav.title).to.have.length.greaterThan(0)
            expect(adFav.title).be.oneOf(titles)

            expect(adFav.description).toBeDefined()
            expect(adFav.description).toBeOfType('string')
            expect(adFav.description).to.have.length.greaterThan(0)
            expect(adFav.description).be.oneOf(descriptions)

            expect(adFav.date).toBeDefined()
            expect(adFav.date).toBeOfTypen.instanceOf(Date)

        })
    })

    describe('when wrong id', () => {
        it('should fail on inexisting id', async () => {
            const id = '012345678901234567890123'

            try {
                await retrieveFavs(id)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()
                expect(error).toBeOfTypen.instanceOf(NotFoundError)

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


afterAll(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
