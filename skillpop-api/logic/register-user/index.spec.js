require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const registerUser = require('.')
const { random } = Math
const { errors: { ContentError } } = require('skillpop-util')
const { database, models: { User } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - register user', () => {
    before(() => database.connect(TEST_DB_URL))

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

        expect(response).to.be.undefined

        const user = await User.findOne({ email })
        const valid = await bcrypt.compare(password, user.password)

        expect(user).to.exist

        expect(user.name).to.equal(name)
        expect(user.surname).to.equal(surname)
        expect(user.city).to.equal(city)
        expect(user.address).to.equal(address)
        expect(user.email).to.equal(email)    
        expect(valid).to.be.true
    })

    describe('when user already exists', () => {
        beforeEach(() => User.create({ name, surname, city, address, email, password }))

        it('should fail on already existing user', async () => {
            try {
                await registerUser(name, surname, city, address, email, password)

                throw Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist

                expect(error.message).to.exist
                expect(typeof error.message).to.equal('string')
                expect(error.message.length).to.be.greaterThan(0)
                expect(error.message).to.equal(`user with email ${email} already exists`)
            }
        })
    })

    it('should fail on incorrect name, surname, email,city, address, password, or expression type and content', () => {
        expect(() => registerUser(1)).to.throw(TypeError, '1 is not a string')
        expect(() => registerUser(true)).to.throw(TypeError, 'true is not a string')
        expect(() => registerUser([])).to.throw(TypeError, ' is not a string')
        expect(() => registerUser({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => registerUser(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => registerUser(null)).to.throw(TypeError, 'null is not a string')

        expect(() => registerUser('')).to.throw(ContentError, 'name is empty or blank')
        expect(() => registerUser(' \t\r')).to.throw(ContentError, 'name is empty or blank')

        expect(() => registerUser(name, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => registerUser(name, true)).to.throw(TypeError, 'true is not a string')
        expect(() => registerUser(name, [])).to.throw(TypeError, ' is not a string')
        expect(() => registerUser(name, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, null)).to.throw(TypeError, 'null is not a string')

        expect(() => registerUser(name, '')).to.throw(ContentError, 'surname is empty or blank')
        expect(() => registerUser(name, ' \t\r')).to.throw(ContentError, 'surname is empty or blank')

        expect(() => registerUser(name, surname, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, true)).to.throw(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, [])).to.throw(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, null)).to.throw(TypeError, 'null is not a string')

        expect(() => registerUser(name, surname, '')).to.throw(ContentError, 'city is empty or blank')
        expect(() => registerUser(name, surname, ' \t\r')).to.throw(ContentError, 'city is empty or blank')

        expect(() => registerUser(name, surname, city, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, city, true)).to.throw(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, city, [])).to.throw(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, city, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, city, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, city, null)).to.throw(TypeError, 'null is not a string')

        expect(() => registerUser(name, surname, city, '')).to.throw(ContentError, 'address is empty or blank')
        expect(() => registerUser(name, surname, city, ' \t\r')).to.throw(ContentError, 'address is empty or blank')

        expect(() => registerUser(name, surname, city, address, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => registerUser(name, surname, city, address, true)).to.throw(TypeError, 'true is not a string')
        expect(() => registerUser(name, surname, city, address, [])).to.throw(TypeError, ' is not a string')
        expect(() => registerUser(name, surname, city, address, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => registerUser(name, surname, city, address, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => registerUser(name, surname, city, address, null)).to.throw(TypeError, 'null is not a string')

        expect(() => registerUser(name, surname, city, address, '')).to.throw(ContentError, 'e-mail is empty or blank')
        expect(() => registerUser(name, surname, city, address, ' \t\r')).to.throw(ContentError, 'e-mail is empty or blank')

        expect(() => registerUser(name, surname, city, address, email,  '')).to.throw(ContentError, 'password is empty or blank')
        expect(() => registerUser(name, surname, city, address, email,  ' \t\r')).to.throw(ContentError, 'password is empty or blank')
    })

    // TODO other cases

    after(() => User.deleteMany().then(database.disconnect))
})
