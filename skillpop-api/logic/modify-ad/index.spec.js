require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const modifyAd = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError, ConflictError }, polyfills: { arrayRandom } } = require('skillpop-util')
const { database, ObjectId, models: { Ad, User } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

arrayRandom()

describe('logic - modify ad', () => {
    before(() => database.connect(TEST_DB_URL))

    let id, name, surname, city, address, email, password, title, description, price
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

        name = `name-${random()}`
        surname = `surname-${random()}`
        email = `email-${random()}@mail.com`
        city = 'barcelona'
        address = 'calle aribau 15'
        password = `password-${random()}`

        const user2 = await User.create({ name, surname, city, address, email, password: hash })

        id2 = user2.id

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
            prices.push(ad.price)
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

    it('should succeed on correct modify', async () => {
        const newTitle = 'Paco'
        const newDescription = 'Pil'
        const newPrice = 15

        const idAd = adIds.random()

        const ador = await Ad.findById(idAd)
        
        expect(ador).to.exist
        expect(ador.title).be.oneOf(titles)
        expect(ador.description).be.oneOf(descriptions)
        expect(ador.price).be.oneOf(prices)

        const response = await modifyAd(id, idAd, newTitle, newDescription, newPrice)

        expect(response).to.be.undefined

        const ad = await Ad.findById(idAd)

        expect(ad).to.exist
        expect(ad.title).to.equal(newTitle)
        expect(ad.description).to.equal(newDescription)
        expect(ad.price).to.equal(newPrice)
    })

    describe('when wrong id', () => {
        it('should fail on wrong id', async () => {
            const id = '012345678901234567890123'
            const idAd = adIds.random()
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(id, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)

                const { message } = error
                expect(message).to.equal(`user with id ${id} not found`)
            }
        })

        it('should fail on wrong idAd', async () => {
            const idAd = '012345678901234567890123'
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(id, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)

                const { message } = error
                expect(message).to.equal(`ad with id ${idAd} not found`)
            }
        })

        it('should fail on user not equal to adId', async () => {
            const idAd = adIds.random()
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(id2, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(ConflictError)

                const { message } = error
                expect(message).to.equal(`user with id ${id2} does not correspond to ad with id ${idAd}`)
            }
        })
        it('should fail not valid id', async () => {
            const id = '//'
            const idAd = adIds.random()
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(id, idAd, newTitle, newDescription, newPrice)

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
            const newTitle = 'Paco'
            const newDescription = 'Pil'
            const newPrice = 15

            try {
                await modifyAd(id, idAd, newTitle, newDescription, newPrice)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(ContentError)

                const { message } = error
                expect(message).to.equal(`${idAd} is not a valid id`)
            }
        })
    })

    it('should fail on incorrect name, surname, city or address type and content', () => {
        expect(() => modifyAd(1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyAd(true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyAd([])).to.throw(TypeError, ' is not a string')
        expect(() => modifyAd({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => modifyAd(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => modifyAd(null)).to.throw(TypeError, 'null is not a string')

        expect(() => modifyAd('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => modifyAd(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => modifyAd(id,  1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyAd(id,  true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyAd(id,  [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyAd(id,  {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => modifyAd(id,  undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => modifyAd(id,  null)).to.throw(TypeError, 'null is not a string')

        expect(() => modifyAd(id,  '')).to.throw(ContentError, 'idAd is empty or blank')
        expect(() => modifyAd(id,  ' \t\r')).to.throw(ContentError, 'idAd is empty or blank')

        expect(() => modifyAd(id, adIds[0], 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyAd(id, adIds[0], true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyAd(id, adIds[0], [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyAd(id, adIds[0], {})).to.throw(TypeError, '[object Object] is not a string')


        expect(() => modifyAd(id, adIds[0], titles[0], 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyAd(id, adIds[0], titles[0], true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyAd(id, adIds[0], titles[0], [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyAd(id, adIds[0], titles[0], {})).to.throw(TypeError, '[object Object] is not a string')

        expect(() => modifyAd(id, adIds[0], titles[0], descriptions[0], true)).to.throw(TypeError, 'true is not a number')
        expect(() => modifyAd(id, adIds[0], titles[0], descriptions[0], [])).to.throw(TypeError, ' is not a number')
        expect(() => modifyAd(id, adIds[0], titles[0], descriptions[0], {})).to.throw(TypeError, '[object Object] is not a number')



    })

    after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
})
