const Book = require('../models/book');
const Author = require('../models/author');
const Genre = require('../models/genre');
const BookInstance = require('../models/bookinstance');

const async = require('async');

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
    }, function(err, result){
        res.render('index', { title: 'Local Library Home', error: err, data: result});
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

exports.book_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Book detail: ' + req.params.id);
};

exports.book_create_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create GET');
};

exports.book_create_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book create POST');
};

exports.book_delete_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete GET');
};

exports.book_delete_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book delete POST');
};

exports.book_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update GET');
};

exports.book_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Book update POST');
};