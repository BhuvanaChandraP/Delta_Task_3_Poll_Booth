const mongoose = require('mongoose');
const Team = require('./teams');
const Schema = mongoose.Schema;

const PollSchema = new Schema({
    team:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Team'
    },
    question:{
        type:String,
    },  
    options:{
        type:[String]
    },
    answers:{
        type:[String]
    },
    state:{
        type:String,
        default: "active"
    },
    deadline:{
        type:Date
    },
    voted:{
        type:[mongoose.Schema.Types.ObjectId],
        ref:'User'
    }


});




const Poll = mongoose.model('Poll',PollSchema);
module.exports = Poll ;