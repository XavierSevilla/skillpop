const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET } } = process
const retrievePublicUser = require('.')
const { random } = Math
const { errors: { NotFoundError, ContentError } } = require('skillpop-util')
const { database, models: { User } } = require('skillpop-data')
require('../../helpers/jest-matchers')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - retrieve public user', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

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
        const user = await User.create({ name, surname, city, address, email, password: hash})

        id = user.id
    })

    it('should succeed on correct user id', async () => {
        const user = await retrievePublicUser(id)

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

        try {
            await retrievePublicUser(id)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })

    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {
        expect(() => retrievePublicUser(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrievePublicUser(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrievePublicUser([])).toThrow(TypeError, ' is not a string')
        expect(() => retrievePublicUser({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrievePublicUser(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrievePublicUser(null)).toThrow(TypeError, 'null is not a string')

        expect(() => retrievePublicUser('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrievePublicUser(' \t\r')).toThrow(ContentError, 'id is empty or blank')
    })

    afterAll(() => User.deleteMany().then(database.disconnect))
})
