require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const { random } = Math
const retrieveUser = require('.')
const { errors: { NotFoundError, ContentError } } = require('skillpop-util')
const { database, models: { User } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - retrieve user', () => {
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

        await User.deleteMany()

        hash = await bcrypt.hash(password, salt)

        const user = await User.create({ name, surname, city, address, email, password: hash })

        id = user.id
    })

    it('should succeed on correct user id', async () => {
        const user = await retrieveUser(id)

        expect(user).to.exist
        expect(user.id).to.equal(id)
        expect(user.id).to.be.a('string')
        expect(user._id).to.not.exist
        expect(user.name).to.equal(name)
        expect(user.name).to.be.a('string')
        expect(user.surname).to.equal(surname)
        expect(user.surname).to.be.a('string')
        expect(user.email).to.equal(email)
        expect(user.email).to.be.a('string')
        expect(user.city).to.equal(city)
        expect(user.city).to.be.a('string')
        expect(user.address).to.equal(address)
        expect(user.address).to.be.a('string')
        expect(user.password).to.be.undefined
        expect(user.lastAccess).to.exist
        expect(user.lastAccess).to.be.an.instanceOf(Date)
    })

    it('should fail on wrong user id', async () => {
        const id = '012345678901234567890123'

        try {
            await retrieveUser(id)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${id} not found`)
        }
    })

    it('should fail on incorrect id or expression type and content', () => {
        expect(() => retrieveUser(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveUser(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveUser([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveUser({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveUser(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveUser(null)).to.throw(TypeError, 'null is not a string')

        expect(() => retrieveUser('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveUser(' \t\r')).to.throw(ContentError, 'id is empty or blank')
    })

    after(() => User.deleteMany().then(database.disconnect))
})
