// require('dotenv').config()
// const { env: { TEST_DB_URL } } = process
// const { expect } = require('chai')
// const saveImageAd = require('.')
// const { random } = Math
// const { errors: { ContentError, NotFoundError }, polyfills: { arrayRandom } } = require('skillpop-util')
// const { database, ObjectId, models: { Ad, User } } = require('skillpop-data')
// const Busboy = require('busboy')
// const bcrypt = require('bcryptjs')
// const salt = 10
// const Busboy = require('busboy')

// arrayRandom()

// describe('logic - modify user', () => {
//     before(() => database.connect(TEST_DB_URL))

//     let id, name, surname, city, address, email, password, title, description, price
//     let hash

//     beforeEach(async () => {
//         name = `name-${random()}`
//         surname = `surname-${random()}`
//         email = `email-${random()}@mail.com`
//         city = 'barcelona'
//         address = 'calle aribau 15'
//         password = `password-${random()}`

//         await Promise.all([User.deleteMany(), Ad.deleteMany()])

//         hash = await bcrypt.hash(password, salt)

//         const user = await User.create({ name, surname, city, address, email, password: hash })

//         id = user.id

//         adIds = []
//         titles = []
//         descriptions = []
//         prices = []

//         const insertions = []

//         for (let i = 0; i < 10; i++) {
//             const ad = {
//                 user: id,
//                 title: `title-${random()}`,
//                 // title:'hey guitar teacher',
//                 description: 'hey guitar teacher',
//                 // description: `description-${random()}`,
//                 price: random(),
//                 date: new Date
//             }

//             insertions.push(Ad.create(ad).then(ad => adIds.push(ad.id)))

//             titles.push(ad.title)
//             descriptions.push(ad.description)
//             prices.push(ad.price)
//         }

//         for (let i = 0; i < 10; i++)
//             insertions.push(Ad.create({
//                 user: ObjectId(),
//                 title: 'hey gu pro',
//                 description: `description-${random()}`,
//                 price: random(),
//                 date: new Date
//             }))

//         await Promise.all(insertions)
//     })

//     it('should succeed on correct save image ', async () => {
//         const idAd = adIds.random()

//         const busboy = new Busboy({ headers: req.headers })

//         busboy.on('file', async (fieldname, file, filename, encoding, mimetype) => {
//             filename = wishId

//         const response = await saveImageAd(id, idAd, newTitle, newDescription, newPrice)

//         console.log(response)
//     })

//     describe('when wrong id', () => {
//         it('should fail on wrong id', async () => {
//             continue
//         })
//     })

//     it('should fail on incorrect name, surname, city or address type and content', () => {
//         expect(() => modifyAd(1)).to.throw(TypeError, '1 is not a string')
//         expect(() => modifyAd(true)).to.throw(TypeError, 'true is not a string')
//         expect(() => modifyAd([])).to.throw(TypeError, ' is not a string')
//         expect(() => modifyAd({})).to.throw(TypeError, '[object Object] is not a string')
//         expect(() => modifyAd(undefined)).to.throw(TypeError, 'undefined is not a string')
//         expect(() => modifyAd(null)).to.throw(TypeError, 'null is not a string')

//         expect(() => modifyAd('')).to.throw(ContentError, 'id is empty or blank')
//         expect(() => modifyAd(' \t\r')).to.throw(ContentError, 'id is empty or blank')

//         expect(() => modifyAd(id,  1)).to.throw(TypeError, '1 is not a string')
//         expect(() => modifyAd(id,  true)).to.throw(TypeError, 'true is not a string')
//         expect(() => modifyAd(id,  [])).to.throw(TypeError, ' is not a string')
//         expect(() => modifyAd(id,  {})).to.throw(TypeError, '[object Object] is not a string')
//         expect(() => modifyAd(id,  undefined)).to.throw(TypeError, 'undefined is not a string')
//         expect(() => modifyAd(id,  null)).to.throw(TypeError, 'null is not a string')

//         expect(() => modifyAd(id,  '')).to.throw(ContentError, 'idAd is empty or blank')
//         expect(() => modifyAd(id,  ' \t\r')).to.throw(ContentError, 'idAd is empty or blank')

//     })

//     after(() => Promise.all([User.deleteMany(), Ad.deleteMany()]).then(database.disconnect))
// })
