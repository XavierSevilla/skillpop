const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const addComment= require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError, CredentialsError} } = require('skillpop-util')
const { ObjectId, database, models: { User, Comment } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')

describe('logic - add comment', () => {
    beforeAll(() => database.connect(TEST_DB_URL))

    let token, name, surname, city, address, email, password
    let hash

    let id, id2, comment, body


    beforeEach(async() => {
        await Promise.all([User.deleteMany()]) 

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
        id = user1.id

        token = jwt.sign({ sub: id }, TEST_SECRET)

                //PERSON
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

    it('should return a correct chat', async() => {
        const commentId = await addComment(token, id2, body)

        const user = await User.findById(id)

        user.comments.forEach(comment => {
            if (comment.id === commentId) {
                expect(comment).toBeDefined()
                expect(comment.id).toBe(commentId)
                expect(comment.user.toString()).toBe(id)
                expect(comment.body).toBe(body)
            }
        })
    })

    it('should throw an NotFoundError because comment doesnt exist', async() => {
        const id = '012345678901234567890123'
        const token = jwt.sign({ sub: id }, TEST_SECRET)
        try {
            await addComment(token, id2, body)

            throw Error('should not reach this point')
        } catch (error) {

            expect(error).toBeDefined()
            expect(error).toBeInstanceOf(NotFoundError)
            expect(error.message).toBe(`user with id ${id} not found`)
        }
    })


    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => addComment(1)).toThrow(TypeError, '1 is not a string')
        expect(() => addComment(true)).toThrow(TypeError, 'true is not a string')
        expect(() => addComment([])).toThrow(TypeError, ' is not a string')
        expect(() => addComment({})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => addComment(undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => addComment(null)).toThrow(TypeError, 'null is not a string')
        expect(() => addComment('')).toThrow(ContentError, 'id is empty or blank')
        expect(() => addComment(' \t\r')).toThrow(ContentError, 'id is empty or blank')


        expect(() => addComment(id, 1)).toThrow(TypeError, '1 is not a string')
        expect(() => addComment(id, true)).toThrow(TypeError, 'true is not a string')
        expect(() => addComment(id, [])).toThrow(TypeError, ' is not a string')
        expect(() => addComment(id, {})).toThrow(TypeError, '[object Object] is not a string')
        expect(() => addComment(id, undefined)).toThrow(TypeError, 'undefined is not a string')
        expect(() => addComment(id, null)).toThrow(TypeError, 'null is not a string')
        expect(() => addComment(id, '')).toThrow(ContentError, 'idCommment is empty or blank')
        expect(() => addComment(id, ' \t\r')).toThrow(ContentError, 'idCommment is empty or blank')

    })


    afterAll(() => Promise.all([User.deleteMany()]).then(database.disconnect))
})