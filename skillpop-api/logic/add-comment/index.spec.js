require('dotenv').config()
const { env: { TEST_DB_URL } } = process
const { expect } = require('chai')
const addComment= require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Comment } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10

describe('logic - add comment', () => {
    before(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash

    let id1, comment


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
        id1 = user1.id

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
        const commentId = await addComment(id1, id2, body)

        const user = await User.findById(id1)

        user.comments.forEach(comment => {
            if (comment.id === commentId) {
                expect(comment).to.exist
                expect(comment.id).to.equal(commentId)
                expect(comment.user.toString()).to.equal(id1)
                expect(comment.body).to.equal(body)
            }
        })
    })

    it('should throw an NotFoundError because chat doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await addComment(fakeId, id2, body)

            throw Error('should not reach this point')
        } catch (error) {

            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${fakeId} not found`)
        }
    })

    it('should fail not valid id', async () => {
        const id = '//'
        
        try {
            await await addComment(id, id2, body)

            throw new Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(ContentError)

            const { message } = error
            expect(message).to.equal(`${id} is not a valid id`)
        }
    })


    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => addComment(1)).to.throw(TypeError, '1 is not a string')
        expect(() => addComment(true)).to.throw(TypeError, 'true is not a string')
        expect(() => addComment([])).to.throw(TypeError, ' is not a string')
        expect(() => addComment({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => addComment(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => addComment(null)).to.throw(TypeError, 'null is not a string')
        expect(() => addComment('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => addComment(' \t\r')).to.throw(ContentError, 'id is empty or blank')


        expect(() => addComment(id1, 1)).to.throw(TypeError, '1 is not a string')
        expect(() => addComment(id1, true)).to.throw(TypeError, 'true is not a string')
        expect(() => addComment(id1, [])).to.throw(TypeError, ' is not a string')
        expect(() => addComment(id1, {})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => addComment(id1, undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => addComment(id1, null)).to.throw(TypeError, 'null is not a string')
        expect(() => addComment(id1, '')).to.throw(ContentError, 'idCommment is empty or blank')
        expect(() => addComment(id1, ' \t\r')).to.throw(ContentError, 'idCommment is empty or blank')

    })


    after(() => Promise.all([User.deleteMany()]).then(database.disconnect))
})