const BookInstance = require('../models/bookinstance');
const Book  = require('../models/book'); 
const { body, validationResult } = require('express-validator');
const async = require('async');

exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
        .populate('book')
        .exec(function (err, list_bookinstances) {
            if (err) return next(err);
            res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
        });
};

exports.bookinstance_detail = function(req, res) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance==null) { 
          var err = new Error('Book copy not found');
          err.status = 404;
          return next(err);
        }
      
      res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
    })
};

exports.bookinstance_create_get = function(req, res, next) {
    
    Book.find({}, 'title')
        .exec(function(err, books) {
            if (err) return next(err);

            res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books});
        });

};

exports.bookinstance_create_post = [
    body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }).escape(),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601().toDate(),

    (req, res, next) => {

        // get all validation errors
        const errors = validationResult(req);

        let bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        });

        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec(function (err, books) {
                    if (err) return next(err);

                    res.render('bookinstance_form', { 
                        title: 'Create BookInstance', book_list: books,
                        errors: errors.array(),
                        book_list: books,
                        bookInstance: bookInstance
                    });
                });
            
            return;
        } else {
            bookInstance.save(function (err) {
                if (err) return next(err);

                res.redirect(bookInstance.url);
            });
        }
    }
];

exports.bookinstance_delete_get = function(req, res, next) {
    

    

    async.parallel({
        instance: function(callback) {
            BookInstance.findById(req.params.id).exec(callback);
        }
    }, function(err, results) {
        if (err) return next(err);

        if (results.instance == null) {
            res.redirect('/catalog/bookinstance');
            return;
        }

        res.render('bookinstance_delete', { title: 'Delete Instance', instance: results.instance});
    });
    
};

exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findByIdAndRemove(req.body.instanceid, (err) => {
        if (err) return next(err);

        res.redirect('/catalog/bookinstances');
    });

};

exports.bookinstance_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update GET');
};

exports.bookinstance_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: BookInstance update POST');
};