require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const removeChat = require('.')
const { random } = Math
const { errors: { ConflictError, NotFoundError, ContentError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat, Message} } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - remove-chat', () => {
    before(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash
    let id1, id2, id3, chatId, message1, message2, messages


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

    it('hould succeed on correct user and chat', async() => {
        await removeChat(id1, chatId)

        const chat = await Chat.findById(chatId)

        expect(chat).to.not.exist

    })

    it('should throw an NotFoundError because chat doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {

            await removeChat(id1, fakeId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user does not have Chat with id ${fakeId}`)
        }
    })

    it('should throw an NotFoundError because user doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await removeChat(fakeId, chatId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${fakeId} not found`)
        }
    })

    it('should throw an ConflictError because user doesnt have open chats', async() => {
        try {
            await removeChat(id3, chatId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ConflictError)
            expect(error.message).to.equal(`user with id ${id3} does not correspond to ad with id ${chatId}`)
        }
    })
    it('should fail not valid id', async () => {
        const id1 = '//'

        try {
            await removeChat(id1, chatId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${id1} is not a valid id`)
        }
    })
    it('should fail not valid id', async () => {
        const chatId = '/'

        try {
            await removeChat(id1, chatId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${chatId} is not a valid ad id`)
        }
    })


    after(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})