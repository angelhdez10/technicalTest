import {gql} from 'apollo-server'
const types = gql`
   enum Order {
        ASC
        DESC
    }

    type User {
        id: ID!
        username: String!
        password: String!
    }

    type Login{
        token: String!
    }

    type Publisher {
        id: ID!
        name: String!
        foundationYear: Int!
        books: [Book]!
    }

    type Book {
        id: ID!
        title: String!
        ISBN: String!
        sypnosis: String
        genres: [String]!
        publicationYear: Int!
        publisher: Publisher!
        authors: [Author]!
    }

    type Author {
        id: ID!
        firstName: String!
        lastName: String!
        country: String!
        books: [Book]!
    }

    type Query {
        allAuthors(
            order: Order
        ): [Author]!
        allBooks(
            title: String
            author: String
            publisher: String
            publicationYear: Int
            titleOr: Order
            publicationYearOr: Order
            page: Int!
        ): [Book]!
        allPublishers: [Publisher]!
        authorById(
            id: ID!
        ): Author
        bookById(
            id: ID!
        ): Book
        publisherById(
            id: ID!
        ): Publisher
    }

    input AuthorInfo {
        firstName: String
        lastName: String
    }

    type Mutation {
        addUser(
            username: String!
            password: String!
        ): User
        login(
            username: String!
            password: String!
        ): Login
        addAuthor(
            firstName: String!
            lastName: String!
            country: String!
        ): Author!
        addBook(
            title: String!
            ISBN: String!
            sypnosis: String!
            genres: [String]!
            publicationYear: Int!
            publisher: String!
            authors: [AuthorInfo]!
        ): Book!
        addPublisher(
            name: String!
            foundationYear: Int!
        ): Publisher!
        editBook(
            id: ID!
            title: String
            ISBN: String
            sypnosis: String
            genres: [String]
            publicationYear: Int
            publisher: String
            authors: [AuthorInfo]
        ): Book!
    } 
`
export default types
