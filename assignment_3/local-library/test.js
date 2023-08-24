const mongoose = require('mongoose');
const Book = require('./models/book')

mongoose.set("strictQuery", false);
const mongoDB = "mongodb+srv://root:G0UE6HuEmUYLCLea@cluster0.56aay6l.mongodb.net/local_library?retryWrites=true&w=majority";

try {
    mongoose.connect(mongoDB);
} catch (err) {
    console.log(err);
}

const allBooks = test();

async function test() {
    return await Book.find({}, "title author")
        .sort({ title: 1 })
        .populate("author")
        .exec;
}

allBooks.then(()=>console.log(allBooks))

console.log("END")