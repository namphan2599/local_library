const mongooes = require('mongoose');

const Schema = mongooes.Schema;

//for date format
const { DateTime } = require('luxon');

const AuthorSchema = new Schema({
    first_name: {type: String, required: true, maxlength: 100},
    family_name: {type: String, required: true, maxlength: 100},
    date_of_birth: {type: Date},
    date_of_death: {type: Date},
});

AuthorSchema
    .virtual('fullname')
    .get(function () {
        return this.family_name + ' ' + this.first_name;
    });

AuthorSchema
    .virtual('url')
    .get(function () {
        return '/catalog/author/' + this._id;
    });

AuthorSchema
    .virtual('date_of_birth_formatted')
    .get(function () {
        return this.date_of_birth ? 
            DateTime.fromJSDate(this.data_of_birth).toLocaleString(DateTime.DATE_MED) :
            'unknown';
    });

AuthorSchema
    .virtual('date_of_death_formatted')
    .get(function () {
        return this.date_of_death ? 
            DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) :
            'unknown';
    });

module.exports = mongooes.model('Author', AuthorSchema);
