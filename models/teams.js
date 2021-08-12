const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
    name:{
        type: String,
        
    },
    owner:{
        type: String,
       
    },   
    description:{
        type: String,
       
    },   
    members:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:'User'
    }, 
    invited:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:'User'
    },       
    polls:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Poll'
       
    },
    chats:{
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Message'

    }


});


const Team = mongoose.model('Team',TeamSchema);
module.exports = Team ;

