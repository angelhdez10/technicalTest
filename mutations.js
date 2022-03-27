import { UserInputError, AuthenticationError } from 'apollo-server';
import User from './models/user.js'
import Publisher from './models/publisher.js'
import Author from './models/author.js'
import Book from './models/book.js'
import bcrypt from 'bcrypt'
import createToken from './authorizated.js'
import jwt from 'jsonwebtoken'

const Mutation =  {
        addUser: async (root, args) => {
            const user = await User.findOne({username: args.username })
            if(user) throw new UserInputError('User already exists')
            const hash = await bcrypt.hash(args.password, 10)
            const newUser = await new User({
                username: args.username,
                password: hash
            }).save().catch(err => {
                throw new UserInputError(err.message, {
                    invalidArgs: args
                })
            })
            return newUser
        },
        login: async(root, args) => {
            const user = await User.findOne({username: args.username})
            const valid = await bcrypt.compare(args.password, user ? user.password : '')
            if(!user || !valid) throw new AuthenticationError('Invalid password or username')
            const token = await createToken(user)
            console.log(token)
            return { token }
        },
        addAuthor:async (root, args, context) => {
            if(!context.currentUser) throw new AuthenticationError('Not authenticated')
            const existentAuthor = await Author.findOne({firstName: args.firstName, lastName: args.lastName})
            if(existentAuthor) throw new UserInputError('Author already exists')
            const author = new Author({...args})
            return author.save().catch((error) => {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            })
        },
        addBook: async (root, args, context) => {
            if(!context.currentUser) throw new AuthenticationError('Not authenticated')
            const book = new Book({...args})
            const existentBook = await Book.findOne({ISBN: args.ISBN})
            if(existentBook) throw new UserInputError('Book already exists', {
                invalidArgs: args.ISBN
            })
            const authors = await Promise.all(args.authors.map(async (author) => {
                const authorDB = await Author.findOne({firstName: author.firstName, lastName: author.lastName})
                if(!authorDB) throw new UserInputError('Author not found')
                return authorDB
            }))
            const publisher = await Publisher.findOne({name: args.publisher})
            if(!publisher) throw new UserInputError('Publisher not exists', {
                invalidArgs: args.publisher
            })
            book.authors = authors
            book.publisher = publisher
            publisher.books = [...publisher.books, book]
            await Promise.all([book.save(), publisher.save(), ...authors.map(async (author) => {
                author.books.push(book)
                return author.save()
            })]).catch(error => {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            })
            return book
        },
        editBook: async (root, args, context) => {
            if(!context.currentUser) throw new AuthenticationError('Not authenticated')
            const book = await Book.findById(args.id).populate('authors').populate('publisher')
            if(!book) throw new UserInputError('Book not found')
            const oldAuthors = await Promise.all(book.authors.map(async (author) => {
                const authorDB = await Author.findById(author._id)
                return authorDB
            }))
            const authors = args.authors && await Promise.all(args.authors.map(async (author) => {
                const authorDB = await Author.findOne({firstName: author.firstName, lastName: author.lastName})
                if(!authorDB) throw new UserInputError('Author not found')
                return authorDB
            }))
            const oldPublisher = args.publisher && await Publisher.findById(book.publisher._id)
            const publisher = args.publisher && await Publisher.findOne({name: args.publisher})
            if(!publisher && args.publisher) throw new UserInputError('Publisher not exists', {
                invalidArgs: args.publisher
            })
            if(args.authors){
                const newAuthors = authors.filter(author => !oldAuthors.find(oldAuthor => oldAuthor.firstName === author.firstName && oldAuthor.lastName === author.lastName))
                const oldAuthorsToDelete = oldAuthors.filter(oldAuthor => !authors.find(author => author.firstName === oldAuthor.firstName && author.lastName === oldAuthor.lastName))
                await Promise.all(newAuthors.map(async (author) => {
                    author.books.push(book)
                    return author.save()
                }))
                await Promise.all(oldAuthorsToDelete.map(async (author) => {
                    author.books = author.books.filter(b => b._id.toString() !== book._id.toString())
                    return author.save()
                }))
                book.authors = authors
            }
            if(args.publisher && oldPublisher.name !== publisher.name){
                oldPublisher.books = oldPublisher.books.filter(b => b._id.toString() !== book._id.toString())
                book.publisher = publisher
                publisher.books = [...publisher.books, book]
                await Promise.all([publisher.save(), oldPublisher.save()])
                
            }
            await Book.updateOne({_id: args.id},{...args, authors: authors ? authors : book.authors, 
                    publisher: publisher ? publisher : book.publisher}).catch(error => {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            })
            return book
        },
        addPublisher: async (root, args, context) => {
            if(!context.currentUser) throw new AuthenticationError('Not authenticated')
            const existentPublisher = await Publisher.findOne({name: args.name})
            if(existentPublisher) throw new UserInputError('Publisher already exists')
            const publisher = new Publisher({...args})
            return publisher.save().catch(error => {
                throw new UserInputError(error.message, {
                    invalidArgs: args
                })
            })
        }
}

export default Mutation
