import { UserInputError, AuthenticationError } from 'apollo-server';
import User from './models/user.js'
import Publisher from './models/publisher.js'
import Author from './models/author.js'
import Book from './models/book.js'

const Query = {
        allAuthors: async (root, args, context) => {
            if(!context.currentUser) throw new AuthenticationError('Unauthorized')
            const authors = await Author.find({}).populate({
                path:'books',
                populate: {
                    path: 'publisher'
                }
            })
            if(!args.order)
                return authors
            const sorteado = authors.sort((a,b) => a.firstName > b.firstName ? 1 : a.firstName < b.firstName ? -1 : 0 )
            return args.order === 'ASC' ? sorteado: sorteado.reverse()
        },
        authorById: async (root, args, context) => {
            if(!context.currentUser) throw new AuthenticationError('Unauthorized')
            if(!args.id) return
            const author = await Author.findById(args.id)?.populate({
                path: 'books',
                populate: {
                    path: 'publisher'    
                }
            })
            if(!author) return
            return author
        },
        allBooks: async (root, args) => {
            if(!args.page) throw new UserInputError('Page is required')
            let page = args.page*10 
            let books = await Book.find({
                title: !args.title ? {$regex : /\w+/} : args.title,
                publicationYear: !args.publicationYear ? {$gt : 0} : args.publicationYear
            })
                .populate({
                    path: 'authors',
                    populate: {
                        path: 'books'
                    }
                })
                .populate({
                    path:'publisher',
                    populate: {
                        path: 'books'
                    }
                })
            .sort(args.titleOr && !args.publicationYearOr ? 
                  {title: args.titleOr} 
                : !args.titleOr && args.publicationYearOr?
                    {publicationYear: args.publicationYearOr}
                :{$natural:1})
            if(args.author)
                books = await books.filter(book => book.authors.some(authors => authors.firstName === args.author || authors.lastName === args.author))
            if(args.publisher)
                books = await books.filter(b => b.publisher.name === args.publisher)
            books = books.slice(page-10, page)
            return books
        },
        bookById: async (root, args)=>{
            if(!args.id || args.id.length !== 24) return
            const book = await Book.findById(args.id)?.populate({
                path: 'authors',
                populate: {
                    path: 'books'
                }
            }).populate({
                path: 'publisher',
                populate: {
                    path: 'books'
                }
            })
            if(!book) return
            return book
        },
        allPublishers: async (root, args) => {
            const publishers = await Publisher.find({})?.populate({
                path:'books',
                populate: {
                    path: 'authors',
                }
            })
            return publishers
        },
        publisherById: async (root, args) => {
            if(!args.id) return
            const publisher = await Publisher.findById(args.id)?.populate({
                path: 'books',
                populate: {
                    path: 'authors'
                }
            })
            if(!publisher) return
            return publisher
        }
}


export default Query


