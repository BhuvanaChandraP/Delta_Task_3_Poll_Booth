const mongoose = require('mongoose');
const Team = require('./teams');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sentBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    content:{
        type:String
    },
    belong:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Team'
    }

});




const Message = mongoose.model('Message',MessageSchema);
module.exports = Message ;