const Genre = require('../models/genre');
const { body, validator, validationResult } = require('express-validator');

exports.genre_list = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre list');
};

exports.genre_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre detail: ' + req.params.id);
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

exports.genre_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genre_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};