import { ApolloServer } from 'apollo-server'
import './db.js'
import jwt from 'jsonwebtoken'
import User from './models/user.js'
import Mutation from './mutations.js'
import Query from './querys.js'
import types from './types.js'

const typeDefs = types 


const resolvers = {
    Query,
    Mutation    
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) => {
        const auth = req ? req.headers.authorization : null
        if(auth && auth.toLowerCase().startsWith('bearer ')){
            const token = auth.substring(7)
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
            const authorizated = await User.findById(decodedToken.id)
            return { currentUser: authorizated }
        }
    }
})

server.listen(process.env.PORT || 4000)
    .then(({url}) => {
        console.log(`Server listen at ${url}`)
    })
    .catch((err) => {
        console.error(err)
    })
