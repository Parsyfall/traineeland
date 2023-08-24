const Author = require("../models/author");
const Book = require('../models/book');
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");


// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
    const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

    res.render("author_list", {
        title: "Author List",
        author_list: allAuthors
    });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author: req.params.id }, "title summary").exec()
    ]);

    if (author === null) {
        // No results
        const err = new Error("Author no found");
        err.status = 404;
        return next(err);
    }

    res.render("author_detail", {
        title: "Author Detail",
        author: author,
        author_books: allBooksByAuthor
    })
});

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
    res.render('author_form', { title: 'Create Author' });
};

// Handle Author create on POST.
exports.author_create_post = [
    // Validate and saniteze fields
    body('first_name')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified"),
    body('family_name')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Family name must be specified"),
    body('date_of_birth', "Invalid date of birth")
        .optional({ values: 'falsy' })
        .isISO8601()
        .toDate(),
    body('date_of_death', "Invalid date of death")
        .optional({ values: 'falsy' })
        .isISO8601()
        .toDate(),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract validation errors from request
        const errors = validationResult(req);

        // Create Author object with escaped and trimmed data
        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death
        });

        if (!errors.isEmpty()) {
            // There are erros
            res.render("author_form", {
                title: "Create Author",
                author: author,
                errors: errors.array()
            });

            console.log(author);
            return;
        }
        // TODO: Check for existing author

        // Form data is valid, save new entry
        await author.save();

        res.redirect(author.url);
    })
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author: req.params.id }, "title summary").exec()
    ]);

    if (author === null) {
        // No results
        res.redirect('/catalog/authors');
    }

    res.render("author_delete", {
        title: "Delete Author",
        author: author,
        author_books: allBooksByAuthor
    });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
    // Get details of author and all their books
    const [author, allBooksByAuthor] = await Promise.all([
        Author.findById(req.params.id).exec(),
        Book.find({ author: req.params.id }, "title summary").exec()
    ]);

    if (allBooksByAuthor.length > 0) {
        // Author has books, render the same way as for GET

        res.render("author_delete", {
            title: "Delete Author",
            author: author,
            author_bookj: allBooksByAuthor
        });
        return;
    }

    // Author has no books. Delete object and redirect to authors list
    await Author.findByIdAndRemove(req.body.authorid);
    res.redirect("/catalog/authors");
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
    const author = await Author.findById(req.params.id).exec();

    if (author === null) {
        // No result
        const err = new Error("Author not found").status(404);
        return next(err);
    }

    res.render("author_form", {
        title: "Update Author",
        author: author
    })
});

// Handle Author update on POST.
exports.author_update_post = [
    // Validate and saniteze fields
    body('first_name')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("First name must be specified"),
    body('family_name')
        .trim()
        .isLength({ min: 1 })
        .escape()
        .withMessage("Family name must be specified"),
    body('date_of_birth', "Invalid date of birth")
        .optional({ values: 'falsy' })
        .isISO8601()
        .toDate(),
    body('date_of_death', "Invalid date of death")
        .optional({ values: 'falsy' })
        .isISO8601()
        .toDate(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const author = new Author({
            first_name: req.body.first_name,
            family_name: req.body.family_name,
            date_of_birth: req.body.date_of_birth,
            date_of_death: req.body.date_of_death,
            _id: req.params.id   // Perserve id
        });

        if (!errors.isEmpty()) {
            // Errors
            res.render("author_form", {
                title: "Update Author",
                author: author,
                errors: errors.array()
            });
            return;
        }

        await Author.findByIdAndUpdate(req.params.id, author);
        res.redirect(author.url);
    })
];
