import mongoose from 'mongoose'

const schema = mongoose.Schema({
    title: {
        type: String,
        require: true,
        minLength: 3
    },
    ISBN: {
        type: String,
        require: true,
    },
    sypnosis: {
        type: String,
        require: true,

    },
    genres: {
        type: [String],
        require: true,
        minLength: 1
    },
    publicationYear: {
        type: Number,
        require: true,
    }, 
    authors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Author'
    }],
    publisher: {
        ref: 'Publisher',
        type: mongoose.Schema.Types.ObjectId
    }
})

export default mongoose.model('Book', schema)
