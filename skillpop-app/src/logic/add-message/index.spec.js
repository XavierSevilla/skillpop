const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const addMessage = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

describe('logic - add Message', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash

    let id1, chatId, body, token


    beforeEach(async() => {
        await Promise.all([User.deleteMany(), Chat.deleteMany()]) 

        //PERSON
        name = `name-${random()}`
        surname = `surname-${random()}`     
        city = 'barcelona'
        address = 'calle aribau 15'
        email = `email-${random()}@mail.com`
        password = `password-${random()}`       

        hash = await bcrypt.hash(password, salt)

        body = `body-${random()}`

        const user1 = await User.create({ name, surname, city, address, email, password: hash })
        id1 = user1.id

        token = jwt.sign({ sub: id1 }, TEST_SECRET)

        const chat = await Chat.create({ users: [ObjectId(id1)], messages: [] })
        chatId = chat.id
    })

    it('should return a correct chat', async() => {
        const messageId = await addMessage(token, chatId, body)

        const chat = await Chat.findById(chatId)

        chat.messages.forEach(message => {
            if (message.id === messageId) {
                expect(message).toBeDefined()
                expect(message.id).toBe(messageId)
                expect(message.user.toString()).toBe(id1)
                expect(message.body).toBe(body)
            }
        })
    })

    it('should throw an NotFoundError because chat doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await addMessage(token, fakeId, body)

            throw Error('should not reach this point')
        } catch (error) {

            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`chat with id ${fakeId} not found`)
        }

    })

    it('should throw an NotFoundError because user doesnt exist', async() => {
        const id = '012345678901234567890123'
        const token = jwt.sign({ sub: id }, TEST_SECRET)
        try {
            await addMessage(token, chatId, body)

            throw Error('should not reach this point')
        } catch (error) {

            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })


    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => addMessage(1)).toThrow(TypeError, '1 is not a string')
        expect(() => addMessage(true)).toThrow(TypeError, 'true is not a string')
        expect(() => addMessage([])).toThrow(TypeError, ' is not a string')
        expect(() => addMessage({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => addMessage(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => addMessage(null)).toThrow(TypeError, 'null is not a string')
        expect(() => addMessage('')).toThrow(ContentError, 'chatId is empty or blank')
        expect(() => addMessage(' \t\r')).toThrow(ContentError, 'chatId is empty or blank')


        expect(() => addMessage(chatId, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => addMessage(chatId, true)).toThrow(TypeError, 'true is not a string')
        expect(() => addMessage(chatId, [])).toThrow(TypeError, ' is not a string')
        expect(() => addMessage(chatId, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => addMessage(chatId, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => addMessage(chatId, null)).toThrow(TypeError, 'null is not a string')
        expect(() => addMessage(chatId, '')).toThrow(ContentError, 'userId is empty or blank')
        expect(() => addMessage(chatId, ' \t\r')).toThrow(ContentError, 'userId is empty or blank')



        expect(() => addMessage(chatId, id1, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => addMessage(chatId, id1, true)).toThrow(TypeError, 'true is not a string')
        expect(() => addMessage(chatId, id1, [])).toThrow(TypeError, ' is not a string')
        expect(() => addMessage(chatId, id1, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => addMessage(chatId, id1, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => addMessage(chatId, id1, null)).toThrow(TypeError, 'null is not a string')
        expect(() => addMessage(chatId, id1, '')).toThrow(ContentError, 'body is empty or blank')
        expect(() => addMessage(chatId, id1, ' \t\r')).toThrow(ContentError, 'body is empty or blank')

    })


    afterAll(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})