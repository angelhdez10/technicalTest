import mongoose from 'mongoose'

const schema = mongoose.Schema({
    name:{
        type: String,
        require: true,
    },
    foundationYear: {
        type: String,
        require: true,
    },
    books: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
    }],
})

export default mongoose.model('Publisher', schema)
