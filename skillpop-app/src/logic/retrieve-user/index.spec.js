const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const retrieveUser = require('.')
const { random } = Math
const { errors: { NotFoundError, ContentError } } = require('skillpop-util')
const { database, models: { User } } = require('skillpop-data')
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - retrieve user', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let id, token, name, surname, city, address, email, password, hash

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

        token = jwt.sign({ sub: id }, TEST_SECRET)
    })

    it('should succeed on correct user id', async () => {
        const user = await retrieveUser(token)

        expect(user).toBeDefined()
        expect(user.id).toBe(id)
        expect(user.id).toBeOfType('string')
        expect(user._id).toBeUndefined()
        expect(user.name).toBe(name)
        expect(user.name).toBeOfType('string')
        expect(user.surname).toBe(surname)
        expect(user.surname).toBeOfType('string')
        expect(user.email).toBe(email)
        expect(user.email).toBeOfType('string')
        expect(user.city).toBe(city)
        expect(user.city).toBeOfType('string')
        expect(user.address).toBe(address)
        expect(user.address).toBeOfType('string')
        expect(user.password).toBeUndefined()
        expect(user.lastAccess).toBeDefined()
        expect(user.lastAccess).toBeInstanceOf(Date)
    })

    it('should fail on wrong user id', async () => {
        const id = '012345678901234567890123'

        const token = jwt.sign({ sub: id }, TEST_SECRET)

        try {
            await retrieveUser(token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })

    afterAll(() => User.deleteMany().then(database.disconnect))
})
