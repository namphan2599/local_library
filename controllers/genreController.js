const Genre = require('../models/genre');
const Book = require('../models/book');

const async = require('async');

const { body, validator, validationResult } = require('express-validator');

exports.genre_list = function(req, res, next) {
    Genre.find()
        .exec(function (err, list) {
            if (err) return next(err);

            res.render('genre_list', { title: 'Genre List', genre_list: list });
        });
};

exports.genre_detail = function(req, res, next) {


    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
                .exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
                .exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);
        if (results.genre === null) {
            let err = new Error('Genre not found');
            err.status = 404;
            return next(err);
        }

        res.render('genre_detail', { title: 'Genre detail', genre: results.genre, genre_books: results.genre_books });
    });

};

exports.genre_create_get = function(req, res) {
    res.render('genre_form', { title: 'Create Genre' });
};

exports.genre_create_post = [
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        let genre = new Genre(
            { name: req.body.name }
        );

        //handle errors
        if (!errors.isEmpty()) {
            res.render('genre_form', { title: 'Create Genre', genre: genre, errors: errors.array()});
            return;
        } else {
            //check exists
            Genre.findOne({ 'name': req.body.name })
                .exec(function(err, isFound) {
                    if(err) return next(err);

                    if(isFound) {
                        console.log(isFound.url)
                        res.redirect(isFound.url);
                    } else {
                        genre.save(function(err) {
                            if (err) return next(err);
                            console.log(genre.url)
                            res.redirect(genre.url);
                        });
                    }
                });
        }
    }
];

exports.genre_delete_get = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ genre: req.params.id }).exec(callback);
        }

    }, function(err, results) {
        if (err) return next(err);

        if (results.genre === null) {
            res.redirect('/catalog/genres');
        }

        res.render('genre_delete', {
            title: 'Delete Genre',
            genre: results.genre,
            genre_books: results.genre_books
        })
    });
};

exports.genre_delete_post = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
            Genre.findById(req.body.genreid).exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ genre: req.body.genreid }).exec(callback);
        }
    }, function(err, results) {

        if (err) return next(err);

        if (results.genre_books.length) {

            res.render('genre_delete', {
                title: 'Delete Genre',
                genre: results.genre,
                genre_books: results.genre_books
            })
        } else {
            Genre.findByIdAndRemove(req.body.genreid, (err) => {
                if (err) return next(err);

                res.redirect('/catalog/genres');
            });
        }
    });
};

exports.genre_update_get = function(req, res) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        res.render('genre_form', { title: 'Update', genre: results.genre})
    });
};

exports.genre_update_post = [
    body('name', 'Genre name required').trim().isLength({ min: 1 }).escape(),
    (req, res, next) => {

        const errors = validationResult(req);
        
        let genre = new Genre({
            name: req.body.name,
            _id: req.params.id
        });

        if (!errors.isEmpty()) {
            async.parallel({
                genre: function(callback) {
                    Genre.findById(req.params.id).exec(callback);
                }
            }, function(err, results) {
                if (err) return next(err);

                res.render({ 
                    title: 'Update Genre', 
                    genre: results.genre, 
                    errors: errors.array()
                });

            });
        } else {
            Genre.findByIdAndUpdate(req.params.id, genre, {}, (err, theGenre) => {
                if (err) return next(err);

                res.redirect(theGenre.url);
            });
        }

    }
];