const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },   
    type:{
        type:String,
        required: true
    },
    gender:{
        type:String,
        required: true
    },  
    teams:{
        type:[String]
    },
    notification:{
        type:[String]
    }


});


UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model('User',UserSchema);
module.exports = User ;
