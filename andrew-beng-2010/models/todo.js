var mongoose = require('mongoose')
  , Schema = mongoose.Schema;
  
  var TodoSchema = new Schema({
    text : String,
    done : Boolean
});


module.exports = mongoose.model('TodoModel', TodoSchema);