import mongoose from 'mongoose'

const schema = mongoose.Schema({
    firstName: {
        type: String,
        require: true,
        minLength: 3
    },
    lastName: {
        type: String,
        require: true,
        minLength: 4
    },
    country:{
        type: String,
        require: true,
        minLength: 3
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }]
})

export default mongoose.model('Author', schema)
