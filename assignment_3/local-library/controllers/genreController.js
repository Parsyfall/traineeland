const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
    const allGenres = await Genre.find().sort({ name: 1 }).exec();

    res.render("genre_list", {
        title: "Genre List",
        genre_list: allGenres
    });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
    const [genre, booksInGenre] = await Promise.all([
        Genre.findById(req.params.id).exec(),
        Book.find({ genre: req.params.id }, "title summary").exec()
    ]);

    if (genre === null) {
        const err = new Error("Genre no found");
        err.status = 404;
        return next(err);
    }

    res.render("genre_detail", {
        title: "Genre Detail",
        genre: genre,
        genre_books: booksInGenre
    });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
    res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // Validate and sanitize the name field
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),

    // Process request after validation and sanitization
    asyncHandler(async (req, res, next) => {
        // Extract the validation errors from request
        const errors = validationResult(req);

        // Create a genre object with escaped and trimmed data
        const genre = new Genre({ name: req.body.name });

        if (!errors.isEmpty()) {
            // There are errors. Render again
            res.render("genre_form", {
                title: "Create Genre",
                genre: genre,
                errors: errors.array()
            });
            return;
        }

        // Data is valid, check if genre already exists
        const GenreExists = await Genre.findOne({ name: req.body.name })
            .collation({ locale: 'en' })
            .exec();

        if (GenreExists) { // Genre exists, redirect to detail page
            res.redirect(GenreExists.url);
        }

        await genre.save();
        // Genre created, redirect to the detail page
        res.redirect(genre.url);

    })
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id);

    if (genre === null) {
        // No results
        res.redirect('/catalog/genres');
    }

    res.render("genre_delete", {
        title: "Delete Genre",
        genre: genre
    });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
    // Delete genre from all books
    await Book.updateMany({}, {
        $pull: { genre: req.body.genreid }
    }).then(err => console.log(err))

    // Delete genre itself
    await Genre.findOneAndDelete(req.body.genreid);
    res.redirect('/catalog/genres');
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
    const genre = await Genre.findById(req.params.id).exec();

    if (genre === null) {
        // No results
        const err = new Error("Genre not found").status(404);
        return next(err);
    }

    res.render("genre_form", { title: "Update Genre", genre: genre })
});

// Handle Genre update on POST.
exports.genre_update_post = [
    body("name", "Genre name must contain at least 3 characters")
        .trim()
        .isLength({ min: 3 })
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        const genre = new Genre({
            name: req.body.name,
            _id: req.params.id  // Perserve id
        });

        if (!errors.isEmpty()) {
            // Errors
            res.render("gerne_form", {
                title: "Update Genre",
                genre: genre,
                errors: errors.array()
            });
            return;
        }

        await Genre.findByIdAndUpdate(req.params.id, genre);
        res.redirect(genre.url);
    })
];