require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const toogleFavAd = require('.')
const { errors: { NotFoundError, ContentError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { User, Ad } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

arrayRandom()

describe('logic - toggle favs', () => {
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

    it('should succeed on correct user and add fav', async () => {
        debugger
        const idAd = adIds.random()
        let isFav = await toogleFavAd(id, idAd)

        expect(isFav).to.be.true
        expect(isFav).to.exist
        expect(isFav).to.be.a('boolean')

        isFav = await toogleFavAd(id, idAd)

        expect(isFav).to.be.false
        expect(isFav).to.exist
        expect(isFav).to.be.a('boolean')

    })


    describe('when wrong id', () => {
        it('should fail on inexisting idUser', async () => {
            const idAd = adIds.random()
            const fakeId = '012345678901234567890123'

            try {
                await toogleFavAd(fakeId, idAd)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)

                const { message } = error
                expect(message).to.equal(`user with id ${fakeId} not found`)
            }
        })
        it('should fail on inexisting idAd', async () => {
            const fakeId = '012345678901234567890123'
            try {
                await toogleFavAd(id, fakeId)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)

                const { message } = error
                expect(message).to.equal(`ad with id ${fakeId} not found`)
            }
        })
        it('should fail not valid id', async () => {
            const id = '//'
            const idAd = adIds.random()

            try {
                await await toogleFavAd(id, idAd)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(ContentError)

                const { message } = error
                expect(message).to.equal(`${id} is not a valid id`)
            }
        })
        it('should fail not valid id', async () => {
            const idAd = '/'

            try {
                await await toogleFavAd(id, idAd)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(ContentError)

                const { message } = error
                expect(message).to.equal(`${idAd} is not a valid id`)
            }
        })
    })

    it('should fail on incorrect id', () => {
        expect(() => toogleFavAd(1)).to.throw(TypeError, '1 is not a string')
        expect(() => toogleFavAd(true)).to.throw(TypeError, 'true is not a string')
        expect(() => toogleFavAd([])).to.throw(TypeError, ' is not a string')
        expect(() => toogleFavAd({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => toogleFavAd(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => toogleFavAd(null)).to.throw(TypeError, 'null is not a string')

        expect(() => toogleFavAd('')).to.throw(ContentError, 'idUser is empty or blank')
        expect(() => toogleFavAd(' \t\r')).to.throw(ContentError, 'idUser is empty or blank')
    })


after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
