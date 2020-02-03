const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL } } = process
const registerUser = require('.')
const { random } = Math
const { errors: { ContentError } } = require('skillpop-util')
const { database, models: { User } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - register user', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password

    beforeEach(() => {
        name = `name-${random()}`
        surname = `surname-${random()}`     
        city = 'barcelona'
        address = 'calle aribau 15'
        email = `email-${random()}@mail.com`
        password = `password-${random()}`

        return User.deleteMany()
    })

    it('should succeed on correct credentials', async () => {
        const response = await registerUser(name, surname, city, address, email, password)
        
        expect(response).toBeUndefined()

        const user = await User.findOne({ email })

        const valid = await bcrypt.compare(password, user.password)

        expect(user).toBeDefined()

        // expect(user.name).toBe(name)
        expect(user.surname).toBe(surname)
        expect(user.city).toBe(city)
        expect(user.address).toBe(address)
        expect(user.email).toBe(email)
        expect(valid).toBeTruthy()
    })

    describe('when user already exists', () => {
        beforeEach(() => User.create({ name, surname, city, address, email, password }))

        it('should fail on already existing user', async () => {
            try {
                await registerUser(name, surname, city, address, email, password)

                throw Error('should not reach this point')
            } catch (error) {
                expect(error).toBeDefined()

                expect(error.message).toBeDefined()
                expect(typeof error.message).toBe('string')
                expect(error.message.length).toBeGreaterThan(0)
                expect(error.message).toBe(`user with email ${email} already exists`)
            }
        })
    })

    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {
        expect(() => registerUser(1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser([])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser('')).toThrow(ContentError, 'name is empty or blank')
        expect(() => registerUser(' \t\r')).toThrow(ContentError, 'name is empty or blank')

        expect(() => registerUser(name, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(name, true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser(name, [])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser(name, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser(name, '')).toThrow(ContentError, 'surname is empty or blank')
        expect(() => registerUser(name, ' \t\r')).toThrow(ContentError, 'surname is empty or blank')

        expect(() => registerUser(name, surname, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, [])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser(name, surname, '')).toThrow(ContentError, 'city is empty or blank')
        expect(() => registerUser(name, surname, ' \t\r')).toThrow(ContentError, 'city is empty or blank')

        expect(() => registerUser(name, surname, city, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, city, true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, city, [])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, city, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, city, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, city, null)).toThrow(TypeError, 'null is not a string')

        expect(() => registerUser(name, surname, city, '')).toThrow(ContentError, 'address is empty or blank')
        expect(() => registerUser(name, surname, city, ' \t\r')).toThrow(ContentError, 'adrdress is empty or blank')

        expect(() => registerUser(name, surname, city, address, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, city, address, true)).toThrow(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, city, address, [])).toThrow(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, city, address, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, city, address, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, city, address, null)).toThrow(TypeError, 'null is not a string')
 
        expect(() => registerUser(name, surname, city, address, '')).toThrow(ContentError, 'email is empty or blank')
        expect(() => registerUser(name, surname, city, address, ' \t\r')).toThrow(ContentError, 'email is empty or blank')

        expect(() => registerUser(name, surname,  city, address, email, '')).toThrow(ContentError, 'password is empty or blank')
        expect(() => registerUser(name, surname,  city, address, email, ' \t\r')).toThrow(ContentError, 'password is empty or blank')
    })

    // TODO other cases

    afterAll(() => User.deleteMany().then(database.disconnect))
})
