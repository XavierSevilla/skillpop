const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const createChat = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

describe('logic - create chat', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash, token, id1, id2

    beforeEach(async() => {

        await Promise.all([User.deleteMany(), Chat.deleteMany()]) 

        name = `name-${random()}`
        surname = `surname-${random()}`     
        city = 'barcelona'
        address = 'calle aribau 15'
        email = `email-${random()}@mail.com`
        password = `password-${random()}`       

        hash = await bcrypt.hash(password, salt)

        const user1 = await User.create({ name, surname, city, address, email, password: hash })
        id1 = user1.id
        
        token = jwt.sign({ sub: id1 }, TEST_SECRET)

        name = `name-${random()}`
        surname = `surname-${random()}`     
        city = 'barcelona'
        address = 'calle aribau 15'
        email = `email-${random()}@mail.com`
        password = `password-${random()}`

        hash = await bcrypt.hash(password, salt)

        const user2 = await User.create({ name, surname, city, address, email, password: hash })
        id2 = user2.id

    })

    it('should succeed on correct user id', async() => {

        const chatId = await createChat(token, id2)
    

        expect(chatId).toBeDefined()
        expect(typeof chatId).toBe('string')

        const chat = await Chat.findById(chatId)

        expect(chat.users.includes(id1)).toBeTruthy()
        expect(chat.users.includes(id2)).toBeTruthy()

        const chatId2 = await createChat(token, id2)

        expect(chatId2).toBeDefined()
        expect(typeof chatId2).toBe('string')
        expect(chatId2).toBe(chatId)

    })

    it('should fail on wrong user id', async() => {

            const id1 = '012345678901234567890123'
            const token = jwt.sign({ sub: id1 }, TEST_SECRET)
        try {
            const chatId = await createChat(token, id2)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id1} not found`)
        }
    })

    it('should fail on wrong user id', async() => {

        const fakeId = ObjectId().toString()
        try {
            const chatId = await createChat(token, fakeId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${fakeId} not found`)
        }
    })


    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => createChat(1)).toThrow(TypeError, '1 is not a string')
        expect(() => createChat(true)).toThrow(TypeError, 'true is not a string')
        expect(() => createChat([])).toThrow(TypeError, ' is not a string')
        expect(() => createChat({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => createChat(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => createChat(null)).toThrow(TypeError, 'null is not a string')

        expect(() => createChat('')).toThrow(ContentError, 'userId1 is empty or blank')
        expect(() => createChat(' \t\r')).toThrow(ContentError, 'userId1 is empty or blank')

        expect(() => createChat(token, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => createChat(token, true)).toThrow(TypeError, 'true is not a string')
        expect(() => createChat(token, [])).toThrow(TypeError, ' is not a string')
        expect(() => createChat(token, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => createChat(token, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => createChat(token, null)).toThrow(TypeError, 'null is not a string')

        expect(() => createChat(token, '')).toThrow(ContentError, 'userId2 is empty or blank')
        expect(() => createChat(token, ' \t\r')).toThrow(ContentError, 'userId2 is empty or blank')

    })


    afterAll(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})