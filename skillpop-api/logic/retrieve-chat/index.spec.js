require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const retrieveChat = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat, Message } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - retrieve-chat', () => {
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

    it('should return a correct chat', async() => {
        const _messages = await retrieveChat(id1, chatId)

        _messages.forEach(message => {
            if (message.id === message1Id) {
                expect(message).to.exist
                expect(message.id).to.equal(message1Id)
                expect(message.user.toString()).to.equal(id1)
            } else if (message.id === message2Id) {
                expect(message).to.exist
                expect(message.id).to.equal(message2Id)
                expect(message.user.toString()).to.equal(id2)

            }

        })
    })

    it('should throw an NotFoundError because chat doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await retrieveChat(id1, fakeId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`chat with id ${fakeId} not found`)
        }
    })

    it('should throw an NotFoundError because id doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await retrieveChat(fakeId, chatId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${fakeId} not found`)
        }
    })

    it('should fail not valid id', async () => {
        const fakeId = '//'

        try {
            await retrieveChat(id1, fakeId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${fakeId} is not a valid id`)
        }
    })
    it('should fail not valid id', async () => {
        const fakeId = '/'

        try {
            await retrieveChat(fakeId, chatId)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${fakeId} is not a valid id`)
        }
    })

    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => retrieveChat(id1, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveChat(id1, true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveChat(id1, [])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveChat(id1, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveChat(id1, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveChat(id1, null)).to.throw(TypeError, 'null is not a string')

        expect(() => retrieveChat(id1, '')).to.throw(ContentError, 'chatId is empty or blank')
        expect(() => retrieveChat(id1, ' \t\r')).to.throw(ContentError, 'chatId is empty or blank')

    })


    after(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})