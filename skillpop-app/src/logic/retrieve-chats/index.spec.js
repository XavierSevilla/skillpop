const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const retrieveChats = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')


describe('logic - retrieveChats', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash, token
    let id1, id2, chatId1, chatId2, chatId3, chatsArray


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

        const user2 = await User.create({ name, surname, city, address, email, password: hash })
        id2 = user2.id

        const chat1 = await Chat.create({ users: [ObjectId(id1), ObjectId(id2)], messages: [] })
        chatId1 = chat1.id

        const chat2 = await Chat.create({ users: [ObjectId(id1), ObjectId(id2)], messages: [] })
        chatId2 = chat2.id

        const chat3 = await Chat.create({ users: [ObjectId(id2), ObjectId(id2)], messages: [] })
        chatId3 = chat2.id

        chatsArray = [chatId1, chatId2]
    })

    it('should return a correct chat', async() => {
        const chats = await retrieveChats(token)

        chats.forEach(chat => {
            expect(chat).toBeDefined()
            expect(chatsArray).toEqual(expect.arrayContaining([chat.id]))

        })
    })

    it('should throw an NotFoundError because user doesnt exist', async() => {
            const id = '012345678901234567890123'
            const token = jwt.sign({ sub: id }, TEST_SECRET)
        try {
            await retrieveChats(token)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toEqual(`user with id ${id} not found`)
        }
    })



    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => retrieveChats(1)).toThrow(TypeError, '1 is not a string')
        expect(() => retrieveChats(true)).toThrow(TypeError, 'true is not a string')
        expect(() => retrieveChats([])).toThrow(TypeError, ' is not a string')
        expect(() => retrieveChats({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => retrieveChats(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => retrieveChats(null)).toThrow(TypeError, 'null is not a string')
        expect(() => retrieveChats('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => retrieveChats(' \t\r')).toThrow(ContentError, 'id is empty or blank')

    })


    afterAll(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})