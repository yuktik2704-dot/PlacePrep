const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true
    },

    developerType:{
        type:String,
        required:true
    },

    difficulty:{
        type:String,
        default:"Medium"
    },

    questions:[
        {
            type:String
        }
    ],

    answers:[
        {
            type:String
        }
    ],

    overallScore:{
        type:Number,
        default:0
    },

    technicalScore:{
        type:Number,
        default:0
    },

    communicationScore:{
        type:Number,
        default:0
    },

    confidenceScore:{
        type:Number,
        default:0
    },

    feedback:{
        type:[String],
        default:[]
    },

    strengths:{
        type:[String],
        default:[]
    },

    improvements:{
        type:[String],
        default:[]
    }

},{
    timestamps:true
});

module.exports = mongoose.model("Interview", interviewSchema);