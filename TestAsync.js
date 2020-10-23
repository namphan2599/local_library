const async = require('async');

async.parallel({
    one: function(callback) {
    
            callback(null, 1);
 
    },
    two: function(callback) {
     
            callback(null, 2);
       
    }
}, function(err, results) {
    // results is now equals to: {one: 1, two: 2}
    console.log(results)
});