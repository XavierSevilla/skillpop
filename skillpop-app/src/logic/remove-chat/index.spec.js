const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const removeChat = require('.')
const { random } = Math
const { errors: { ConflictError, NotFoundError, ContentError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat, Message} } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

describe('logic - remove-chat', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash
    let id1, id2, id3, chatId, message1, message2, messages, token, message1Id, message2Id


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

    it('should succeed on correct user and chat', async() => {
        await removeChat(token, chatId)

        const chat = await Chat.findById(chatId)

        expect(chat).toBeNull()

    })

    it('should throw an NotFoundError because chat doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {

            await removeChat(token, fakeId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user does not have Chat with id ${fakeId}`)
        }
    })

    it('should throw an NotFoundError because user doesnt exist', async() => {
            const id = '012345678901234567890123'
            const token = jwt.sign({ sub: id }, TEST_SECRET)
        try {
            await removeChat(token, chatId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })

    it('should throw an ConflictError because user doesnt have open chats', async() => {
         const token = jwt.sign({ sub: id3 }, TEST_SECRET)
        try {
            await removeChat(token, chatId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(ConflictError)
            expect(error.message).toBe(`user with id ${id3} does not correspond to ad with id ${chatId}`)
        }
    })

    afterAll(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})