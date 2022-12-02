const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://adminexpress:8sX5ruyGiscOTpya@expressjs.ruclfye.mongodb.net/mydata?retryWrites=true&w=majority');
var db = mongoose.connection;

module.exports= mongoose;