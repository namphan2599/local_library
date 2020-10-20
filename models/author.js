const mongooes = require('mongoose');

const Schema = mongooes.Schema;

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    data_of_birth: {type: Date},
    date_of_death: {type: Date},
});

AuthorSchema
    .virtual('fullname')
    .get(function() {
        return this.family_name + ' ' + this.first_name;
    });

AuthorSchema
    .virtual('url')
    .get(function() {
        return '/catalog/author/' + this._id;
    });

module.exports = mongooes.model('Author', AuthorSchema);
