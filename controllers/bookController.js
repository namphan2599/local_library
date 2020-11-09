const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const async = require('async');
const { body, validationResult } = require('express-validator');
const genre = require('../models/genre');

exports.index = function(req, res) {

    async.parallel({
        book_count: function(callback) {
            Book.countDocuments({}, callback);
        },
        book_instance_count: function(callback) {
            BookInstance.countDocuments({}, callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.countDocuments({ status: 'Available' }, callback);
        },
        authot_count: function(callback) {
            Author.countDocuments({}, callback);
        },
        genre_count: function(callback) {
            Genre.countDocuments({}, callback);
        },
    }, function(err, results){
        res.render('index', { title: 'Local Library Home', error: err, data: results});
    });
    
};

exports.book_list = function(req, res) {
    
    Book.find({}, 'title author')
        .populate('author')
        .exec(function (err, books){
            if(err) return async.next(err);

            res.render('book_list', { title: 'Book List', books: books });
        });

};

exports.book_detail = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback);
        },
        book_instance: function(callback) {
            BookInstance.find({ 'book': req.params.id })
            .exec(callback);
        }
    },function(err, results) {
        if (err) return next(err);
        if(results.book === null) {
            let err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        
        res.render('book_detail', { title: 'Book: ', book: results.book, book_instances: results.book_instance})
    });
};

exports.book_create_get = function(req, res, next) {

    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        res.render('book_form', { title: 'Create Book', authors: results.authors, genres: results.genres });
    });
}

exports.book_create_post = [
    // Convert the genre to an array.
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre ==='undefined')
            req.body.genre = [];
            else
            req.body.genre = new Array(req.body.genre);
        }
        next();
    },

    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped and trimmed data.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Create Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            book.save(function (err) {
                if (err) { return next(err); }
                   //successful - redirect to new book record.
                   res.redirect(book.url);
                });
        }
    }
];

exports.book_delete_get = function(req, res) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).exec(callback);
        },

        book_bookinstances: function(callback) {
            BookInstance.find({ book: req.params.id }).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        if (results.book === null) {
            res.redirect('/catalog/books');
        }

        res.render('book_delete', {
            title: 'Book Delete',
            book: results.book,
            book_bookinstances: results.book_bookinstances,
        });
    })

};

exports.book_delete_post = function(req, res) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.body.bookid).exec(callback);
        },

        book_bookinstances: function(callback) {
            BookInstance.find({ book: req.params.id }).exec(callback);
        }
    }, function(err, results) {

        if (err) return next(err);

        if (results.book_bookinstances.length) {
            res.render('book_delete', {
                title: 'Book Delete',
                book: results.book,
                book_bookinstances: results.book_bookinstances,
            });
        } else {
            Book.findByIdAndRemove(req.body.bookid, (err) => {
                if (err) return next(err);

                res.redirect('/catalog/books');
            });
        }
    });
};

exports.book_update_get = function(req, res) {

    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        }

    }, function(err, results) {
        if (err)  return next(err); 

        if (results.book==null) { // No results.
            var err = new Error('Book not found');
            err.status = 404;
            return next(err);
        }

        for (let all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
            for (let book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                if (results.genres[all_g_iter]._id.toString()===results.book.genre[book_g_iter]._id.toString()) {
                    results.genres[all_g_iter].checked='true';
                }
            }
        }

        res.render('book_form', { title: 'Update Book', authors: results.authors, genres: results.genres, book: results.book });

            
    });

    
};

exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
   
    // Validate and sanitise fields.
    body('title', 'Title must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('author', 'Author must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('summary', 'Summary must not be empty.').trim().isLength({ min: 1 }).escape(),
    body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
    body('genre.*').escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors: results.authors, genres: results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];