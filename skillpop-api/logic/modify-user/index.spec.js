require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const modifyUser = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { database, models: { User } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - modify user', () => {
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

    it('should succeed on correct modify', async () => {
        const newName = 'Paco'
        const newSurname = 'Pil'
        const newcity = 'madrid'

        const userOr = await User.findById(id)

        expect(userOr).to.exist
        expect(userOr.name).to.equal(name)
        expect(userOr.surname).to.equal(surname)
        expect(userOr.city).to.equal(city)
        expect(userOr.address).to.equal(address)

        const response = await modifyUser(id, newName, newSurname, newcity, address)

        expect(response).to.be.undefined

        const user = await User.findById(id)

        expect(user).to.exist
        expect(user.name).to.equal(newName)
        expect(user.surname).to.equal(newSurname)
        expect(user.city).to.equal(newcity)
        expect(user.address).to.equal(address)
    })

    describe('when wrong id', () => {
        it('should fail on wrong id', async () => {
            const id = '012345678901234567890123'

            try {
                await modifyUser(id, name, surname, city, address)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(NotFoundError)

                const { message } = error
                expect(message).to.equal(`user with id ${id} not found`)
            }
        })
        it('should fail not valid id', async () => {
            const id = '//'

            try {
                await modifyUser(id, name, surname, city, address)

                throw new Error('should not reach this point')
            } catch (error) {
                expect(error).to.exist
                expect(error).to.be.an.instanceOf(ContentError)

                const { message } = error
                expect(message).to.equal(`${id} is not a valid id`)
            }
        })
    })

    it('should fail on incorrect name, surname, city or address type and content', () => {
        expect(() => modifyUser(1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyUser(true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyUser([])).to.throw(TypeError, ' is not a string')
        expect(() => modifyUser({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => modifyUser(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => modifyUser(null)).to.throw(TypeError, 'null is not a string')

        expect(() => modifyUser('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => modifyUser(' \t\r')).to.throw(ContentError, 'id is empty or blank')

        expect(() => modifyUser(id, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyUser(id, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyUser(id, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyUser(id, {})).to.throw(TypeError, '[object Object] is not a string')


        expect(() => modifyUser(id,name, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyUser(id,name, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyUser(id,name, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyUser(id,name, {})).to.throw(TypeError, '[object Object] is not a string')

        expect(() => modifyUser(id,name, surname, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyUser(id,name, surname, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyUser(id,name, surname, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyUser(id,name, surname, {})).to.throw(TypeError, '[object Object] is not a string')

        expect(() => modifyUser(id,name, surname, city, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => modifyUser(id,name, surname, city, true)).to.throw(TypeError, 'true is not a string')
        expect(() => modifyUser(id,name, surname, city, [])).to.throw(TypeError, ' is not a string')
        expect(() => modifyUser(id,name, surname, city, {})).to.throw(TypeError, '[object Object] is not a string')


    })

    after(() => User.deleteMany().then(database.disconnect))
})
