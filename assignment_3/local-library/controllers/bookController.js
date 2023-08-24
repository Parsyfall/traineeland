const Book = require("../models/book");
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
    const [
        numBooks,
        numBookInstances,
        numAvailableBookInstances,
        numAuthors,
        numGenres,
    ] = await Promise.all([
        Book.countDocuments({}).exec(),
        BookInstance.countDocuments({}).exec(),
        BookInstance.countDocuments({ status: "Available" }).exec(),
        Author.countDocuments({}).exec(),
        Genre.countDocuments({}).exec(),
    ]);

    res.render("index", {
        title: "Local Library Home",
        book_count: numBooks,
        book_instance_count: numBookInstances,
        book_instance_available_count: numAvailableBookInstances,
        author_count: numAuthors,
        genre_count: numGenres,
    });
});

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {

    const allBooks = await Book.find({}, "title author")
        .sort({ title: 1 })
        .populate("author")
        .exec();

    res.render("book_list", { title: "Book List", book_list: allBooks })

});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
    const [book, bookinstances] = await Promise.all([
        Book.findById(req.params.id)
            .populate("author")
            .populate("genre")
            .exec(),
        BookInstance.find({ book: req.params.id }).exec()
    ]);

    if (book === null) {
        // No results
        const err = new Error("Book not found");
        err.status = 404;
        next(err);
    }

    res.render("book_detail", {
        title: book.title,
        book: book,
        book_instances: bookinstances
    })
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
    // Get all authors and genres that can be added to the new book
    const [allAuthors, allGenres] = await Promise.all([
        Author.find().exec(),
        Genre.find().exec()
    ]);

    res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        genres: allGenres
    });
});

// Handle book create on POST.
exports.book_create_post = [
    // Convert the genre to an array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') {
                req.body.genre = [];
            } else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },

    // Validate and sanite fields
    body('title', "Titel must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('author', "Author must no be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('summary', "Summary must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('isbn', "ISBN must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body("genre.*").escape(),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract errors
        const errors = validationResult(req);

        // Create the new Book with processed data
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        });

        if (!errors.isEmpty()) {
            // There are errors, render again

            // Get all authors and genres for form
            const [allAuthors, allGenres] = await Promise.all([
                Author.find().exec(),
                Genres.find().exec()
            ]);

            // Mark selected genres as checked
            for (const genre of allGenres) {
                if (book.genre.includes(genre._id)) {
                    genre.checked = 'true';
                }
            }

            res.render("book_form", {
                title: "Create Book",
                authors: allAuthors,
                genres: allGenres,
                book: book,
                errors: errors.array()
            });
        } else {
            // Form data is valid, save book
            await book.save();
            res.redirect(book.url);
        }
    })

];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
    const [book, bookinstances] = await Promise.all([
        Book.findById(req.params.id).populate('author').populate('genre').exec(),
        BookInstance.find({ book: req.params.id }).exec()
    ]);

    console.log("Book instances: ", bookinstances.length)

    if (book === null) {
        // No results
        res.redirect('/catalog/books');
    }

    res.render("book_delete", {
        title: "Delete Book",
        book: book,
        bookinstances: bookinstances
    });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
    const [book, bookinstances] = await Promise.all([
        Book.findById(req.params.id)
            .populate("author")
            .populate("genre")
            .exec(),
        BookInstance
            .find({ book: req.params.id })
            .exec(),
    ]);

    if (bookinstances.length > 0) {
        // There are still instances of this book, render again

        res.render("book_delete", {
            title: "Delete Genre",
            book: book,
            bookinstances: bookinstances
        });
        return;
    }

    await Book.findByIdAndDelete(req.body.bookid).exec();
    res.redirect('/catalog/books')
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
    const [book, allAuthors, allGenres] = await Promise.all([
        Book.findById(req.params.id)
            .populate("author")
            .populate("genre")
            .exec(),
        Author.find().exec(),
        Genre.find().exec()
    ]);

    if (book === null) {
        // No results
        const err = new Error("Book not found")
        err.status = 404;
        return next(err);
    }

    // Mark selected genres as checked
    for (const genre of allGenres) {
        for (const book_g of book.genre) {
            if (genre._id.toString() === book_g._id.toString()) {
                genre.checked = 'true';
            }
        }
    }

    res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        genres: allGenres,
        book: book
    })

});

// Handle book update on POST.
exports.book_update_post = [
    // Convert genres to array
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            (typeof req.body.genre === 'undefined')
                ? req.body.genre = []
                : req.body.genre = new Array(req.body.genre)
        }

        next();
    },

    // Validate and sanitize
    body('title', "Title must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('author', "Author must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('summary', "Summary must not be empty.")
        .trim()
        .isLength({ min: 1 })
        .escape(),
    body('isbn', "ISBN must not be empty")
        .trim()
        .isLength({ min: 1 })
        .escape(),

    // Process request
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: typeof req.body.genre === 'undefined'
                ? []
                : req.body.genre,
            _id: req.params.id  // Prevent changing the ID
        });

        if (!errors.isEmpty()) {
            // Errors!

            // Get all authors and genres for form
            const [allAuthors, allGenres] = Promise.all([
                Author.find().exec(),
                Genre.find().exec(),
            ]);

            // Mark selected genres as checked
            for (const genre of allGenres) {
                if (book.genre.indexOf(genre._id) > -1) {
                    genre.checked = 'true';
                }
            }

            res.render('book_form', {
                title: "Update Book",
                authors: allAuthors,
                genres: allGenres,
                book: book,
                errors: errors.array()
            });
            return;
        }

        // Data from form is valid. Update
        const updatedBook = await Book.findByIdAndUpdate(req.params.id, book, {})
        res.redirect(updatedBook.url);
    })
]
