var mongoose = require('mongoose');
mongoose.connection.on('error', function(err) {
	console.error("db connection error: " + err);
});
mongoose.connection.once('open', function callback() {
    console.log("db connection open");
});
mongoose.connection.on("connected", function() {
	console.log("Connect to MongoDb success");
});
mongoose.connection.on("disconnected", function() {
	console.log("MongoDB disconnected");
});
exports.connect = function() {
	mongoose.connect('mongodb://127.0.0.1:27017/asfman');
}
exports.disconnect = function() {
    mongoose.disconnect();
}