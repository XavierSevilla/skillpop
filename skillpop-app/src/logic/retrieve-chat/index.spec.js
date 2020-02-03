const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const retrieveChat = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat, Message } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

describe('logic - retrieve-chat', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash, token
    let id1, id2, id3, chatId, message1, message2, messages, message1Id, message2Id


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

        const user1 = await User.create({ name, surname, city, address, email, password: hash })
        id1 = user1.id

        token = jwt.sign({sub: id1}, TEST_SECRET)

        name = `name-${random()}`
        surname = `surname-${random()}`     
        city = 'barcelona'
        address = 'calle aribau 15'
        email = `email-${random()}@mail.com`
        password = `password-${random()}`       

        hash = await bcrypt.hash(password, salt)

        const user2 = await User.create({ name, surname, city, address, email, password: hash })
        id2 = user2.id

        name = `name-${random()}`
        surname = `surname-${random()}`     
        city = 'barcelona'
        address = 'calle aribau 15'
        email = `email-${random()}@mail.com`
        password = `password-${random()}`       

        hash = await bcrypt.hash(password, salt)

        const user3 = await User.create({ name, surname, city, address, email, password: hash })
        id3 = user3.id

        const chat = await Chat.create({ users: [ObjectId(id2), ObjectId(id1)], messages: [] })
        chatId = chat.id

        message1 = new Message({ user: ObjectId(id1), body: "First message", date: new Date })
        message1Id = message1.id

        message2 = new Message({ user: ObjectId(id2), body: "Second message", date: new Date })
        message2Id = message2.id

        // messages = [message1, message2]

        chat.messages.push(message1.toObject())
        chat.messages.push(message2.toObject())

        await chat.save()

    })

    it('should return a correct chat', async() => {
        const _messages = await retrieveChat(token, chatId)

        _messages.forEach(message => {
            if (message.id === message1Id) {
                expect(message).toBeDefined()
                expect(message.id).toBe(message1Id)
                expect(message.user.toString()).toBe(id1)
            } else if (message.id === message2Id) {
                expect(message).toBeDefined()
                expect(message.id).toBe(message2Id)
                expect(message.user.toString()).toBe(id2)

            }

        })
    })

    it('should throw an NotFoundError because chat doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await retrieveChat(token, fakeId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`chat with id ${fakeId} not found`)
        }
    })

    it('should throw an NotFoundError because id doesnt exist', async() => {
            const id = '012345678901234567890123'
            const token = jwt.sign({ sub: id }, TEST_SECRET)
        try {
            await retrieveChat(token, chatId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })

    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => retrieveChat( 1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveChat( true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveChat( [])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveChat( {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveChat( undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveChat( null)).toThrow(TypeError, 'null is not a string')
        expect(() => retrieveChat( '')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveChat( ' \t\r')).toThrow(ContentError, 'id is empty or blank')


        expect(() => retrieveChat(token, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveChat(token, true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveChat(token, [])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveChat(token, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveChat(token, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveChat(token, null)).toThrow(TypeError, 'null is not a string')

        expect(() => retrieveChat(token, '')).toThrow(ContentError, 'chatId is empty or blank')
        expect(() => retrieveChat(token, ' \t\r')).toThrow(ContentError, 'chatId is empty or blank')

    })


    afterAll(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})