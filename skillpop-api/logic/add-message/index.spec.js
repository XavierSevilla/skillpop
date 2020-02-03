require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const addMessage = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Chat } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - add Message', () => {
    before(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash

    let id1, chatId, body


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


        const chat = await Chat.create({ users: [ObjectId(id1)], messages: [] })
        chatId = chat.id
    })

    it('should return a correct chat', async() => {
        const messageId = await addMessage(chatId, id1, body)

        const chat = await Chat.findById(chatId)

        chat.messages.forEach(message => {
            if (message.id === messageId) {
                expect(message).to.exist
                expect(message.id).to.equal(messageId)
                expect(message.user.toString()).to.equal(id1)
                expect(message.body).to.equal(body)
            }
        })
    })

    it('should throw an NotFoundError because chat doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await addMessage(fakeId, id1, body)

            throw Error('should not reach this point')
        } catch (error) {

            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`chat with id ${fakeId} not found`)
        }
    })


    it('should throw an NotFoundError because user doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await addMessage(chatId, fakeId, body)

            throw Error('should not reach this point')
        } catch (error) {

            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${fakeId} not found`)
        }
    })
    it('should fail not valid id', async () => {
        const chatId = '//'

        try {
            await addMessage(chatId, id1, body)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${chatId} is not a valid id`)
        }
    })
    it('should fail not valid id', async () => {
        const id1 = '/'

        try {
            await addMessage(chatId, id1, body)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${id1} is not a valid id`)
        }
    })


    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => addMessage(1)).to.throw(TypeError, '1 is not a string')
        expect(() => addMessage(true)).to.throw(TypeError, 'true is not a string')
        expect(() => addMessage([])).to.throw(TypeError, ' is not a string')
        expect(() => addMessage({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => addMessage(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => addMessage(null)).to.throw(TypeError, 'null is not a string')
        expect(() => addMessage('')).to.throw(ContentError, 'chatId is empty or blank')
        expect(() => addMessage(' \t\r')).to.throw(ContentError, 'chatId is empty or blank')


        expect(() => addMessage(chatId, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => addMessage(chatId, true)).to.throw(TypeError, 'true is not a string')
        expect(() => addMessage(chatId, [])).to.throw(TypeError, ' is not a string')
        expect(() => addMessage(chatId, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => addMessage(chatId, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => addMessage(chatId, null)).to.throw(TypeError, 'null is not a string')
        expect(() => addMessage(chatId, '')).to.throw(ContentError, 'userId is empty or blank')
        expect(() => addMessage(chatId, ' \t\r')).to.throw(ContentError, 'userId is empty or blank')



        expect(() => addMessage(chatId, id1, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => addMessage(chatId, id1, true)).to.throw(TypeError, 'true is not a string')
        expect(() => addMessage(chatId, id1, [])).to.throw(TypeError, ' is not a string')
        expect(() => addMessage(chatId, id1, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => addMessage(chatId, id1, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => addMessage(chatId, id1, null)).to.throw(TypeError, 'null is not a string')
        expect(() => addMessage(chatId, id1, '')).to.throw(ContentError, 'body is empty or blank')
        expect(() => addMessage(chatId, id1, ' \t\r')).to.throw(ContentError, 'body is empty or blank')

    })


    after(() => Promise.all([User.deleteMany(), Chat.deleteMany()]).then(database.disconnect))
})