require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const retrieveChats = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10


describe('logic - retrieveChats', () => {
    before(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash
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
        const chats = await retrieveChats(id1)

        chats.forEach(chat => {
            expect(chat).to.exist
            expect(chat.id).to.be.oneOf(chatsArray)

        })
    })

    it('should throw an NotFoundError because user doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await retrieveChats(fakeId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${fakeId} not found`)
        }
    })



    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => retrieveChats(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveChats(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveChats([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveChats({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveChats(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveChats(null)).to.throw(TypeError, 'null is not a string')
        expect(() => retrieveChats('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveChats(' \t\r')).to.throw(ContentError, 'id is empty or blank')

    })


    after(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})