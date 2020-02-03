const { env: { REACT_APP_TEST_DB_URL: TEST_DB_URL, REACT_APP_TEST_SECRET: TEST_SECRET  } } = process
const retrieveComments = require('.')
const { random } = Math
const { errors: { ContentError, NotFoundError } } = require('skillpop-util')
const { ObjectId, database, models: { User, Comment } } = require('skillpop-data')
const bcrypt = require('bcryptjs')
const salt = 10
const jwt = require('jsonwebtoken')
require('../../helpers/jest-matchers')


describe('logic - retrieveComments', () => {
    before(() => database.connect(TEST_DB_URL))

    let name, surname, city, address, email, password
    let hash
    let id1
    let arrayComments=[]


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

        const user1 = await User.create({ name, surname, city, address, email, password: hash })
        id1 = user1.id

        
        const comment1 = new Comment({ user: id1, body: "hola", date: new Date })
        const comment2 = new Comment({ user: id1, body: "bien", date: new Date })

        
        arrayComments.push(comment1.id, comment2.id)

        user1.comments.push(comment1, comment2)
        await user1.save()

    })

    it('should return a correct comments', async() => {
        const comments = await retrieveComments(id1)

        debugger
        comments.forEach(comment => {
            expect(comment).to.exist
            expect(comment.id).to.be.oneOf(arrayComments)
            expect(comment.user.toString()).to.equal(id1)

        })
    })

    it('should throw an NotFoundError because user doesnt exist', async() => {
        const fakeId = ObjectId().toString()
        try {
            await retrieveComments(fakeId)

            throw Error('should not reach this point')
        } catch (error) {
            expect(error).to.exist
            expect(error).to.be.an.instanceOf(NotFoundError)
            expect(error.message).to.equal(`user with id ${fakeId} not found`)
        }
    })



    it('should fail on incorrect name, surname, email, password, or expression type and content', () => {

        expect(() => retrieveComments(1)).to.throw(TypeError, '1 is not a string')
        expect(() => retrieveComments(true)).to.throw(TypeError, 'true is not a string')
        expect(() => retrieveComments([])).to.throw(TypeError, ' is not a string')
        expect(() => retrieveComments({})).to.throw(TypeError, '[object Object] is not a string')
        expect(() => retrieveComments(undefined)).to.throw(TypeError, 'undefined is not a string')
        expect(() => retrieveComments(null)).to.throw(TypeError, 'null is not a string')
        expect(() => retrieveComments('')).to.throw(ContentError, 'id is empty or blank')
        expect(() => retrieveComments(' \t\r')).to.throw(ContentError, 'id is empty or blank')

    })


    after(() => Promise.all([User.deleteMany()]).then(database.disconnect))
})