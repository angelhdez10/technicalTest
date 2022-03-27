import faker from 'faker';
import mongoDB from 'mongodb';
import mongoose from 'mongoose'
import * as dot from 'dotenv'
dot.config()

const mongoUri = process.env.MONGO_URI
const dbName = process.env.DB_NAME
console.log(mongoUri, dbName)

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB')
        dataSeed()
    })
    .catch(error => {
        console.log(error)
    })


async function dataSeed() {
    const client = new mongoDB.MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    try{
        await client.connect()
        const authors = client.db(dbName).collection('authors')
        const publishers = client.db(dbName).collection('publishers');
        const books = client.db(dbName).collection('books');
        //authors.drop() 
        publishers.drop()
        books.drop()
        let authorsArr = []
        for(let i = 0; i < 20; i++){
            const author = {
                _id: mongoose.Types.ObjectId(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                country: faker.address.country(),
                books: []
            }
            authorsArr.push(author)
        }
        let publisherArray = []
        for(let i = 0; i < 20; i++){
            const publisher = {
                _id: mongoose.Types.ObjectId(),
                name: faker.company.companyName(),
                foundationYear: faker.date.past().getFullYear(),
                books: []
            }
            publisherArray = [...publisherArray, publisher]
        }
        let booksArr = []
        for(let i = 0; i < 50; i++){
            let firstIndex = Math.floor(Math.random() * authorsArr.length)
            let secondIndex = Math.floor(Math.random() * authorsArr.length)
            let pindex = Math.floor(Math.random() * publisherArray.length)
            let authorsBook = [authorsArr[firstIndex]._id, authorsArr[secondIndex]._id]
            let publisherBook = publisherArray[pindex]._id
            const book = {
                _id: mongoose.Types.ObjectId(),
                title: faker.lorem.words(),
                ISBN: faker.datatype.number().toString(),
                sypnosis: faker.lorem.paragraph(),
                genres: [faker.lorem.words()],
                publicationYear: faker.date.past().getFullYear(),
                authors: [mongoose.Types.ObjectId(authorsBook[0]), mongoose.Types.ObjectId(authorsBook[1])],
                publisher: mongoose.Types.ObjectId(publisherBook),
            }
            authorsArr[firstIndex].books.push(book._id)
            authorsArr[secondIndex].books.push(book._id)
            publisherArray[pindex].books.push(book._id)
            booksArr = [...booksArr, book]
        }
        console.log(booksArr)
        await Promise.all([
            authors.insertMany(authorsArr),
            publishers.insertMany(publisherArray),
            books.insertMany(booksArr)
        ])
        console.log('Data seeded')
        client.close()
    }catch(error){
        console.log(error)
    }
}



