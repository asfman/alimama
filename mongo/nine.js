var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var nineScheMa = new Schema({
    title: {
        type: String,
        unique: true,
        required:true 
    },
    recommend_text: String,
    buy_num: Number,
    cur_price: {
       type: Number,
       required:true
    },
    origin_price: {
       type: Number,
       required:true
    },
    img: String,
    weight: Number,
    published: {
        type: Boolean,
        default: false
    },
    url: String,
    type: String,
    created_time: {
        type: Date,
        default: Date.now
    }
});

var  nineModel = mongoose.model('nine', nineScheMa);
exports.nineModel = nineModel;
