const mongoose=require('mongoose');
const resumeSchema=new mongoose.Schema({
// -------- Basic Details --------
    name:{
        type: String,
        required: true
    },
    email: {
        type:String,
        required:true
    },
    phone: {
        type: String,
        required: true
    },
    github: {
        type:String
        
    },
    linkedin: {
        type:String
        
    },
    skills:{
        type:[String],
        default:[]       
    },
    education:{
        type: String,
        default: ""
    },
    experience:{ 
        type:String,
        default:""
    },
  // -------- AI Analysis --------  
    atsScore:{
        type:Number,
        default:0
    },

    developerType: {
        type:String,
        default:"Beginner"
    },
    summary: {
    type: String,
    default: ""
},

sectionScores: {
    skills: {
        type: Number,
        default: 0
    },
    projects: {
        type: Number,
        default: 0
    },
    experience: {
        type: Number,
        default: 0
    },
    education: {
        type: Number,
        default: 0
    },
    formatting: {
        type: Number,
        default: 0
    }
},
    missingSkills:{
        type:[String],
        default:[]
    },
    
    resumeSuggestions: [

    {

        type: String

    }

],
    strengths: {
    type: [String],
    default: []
    },

    weaknesses: {
    type: [String],
    default: []
    },
    
    existingProjects:{
        type:[String],
        default:[]
    },

    recommendedProjects: [

        {
            _id:false,
        title: {
            type: String
        },
        description: {
            type: String
        }
        }
    ],
    roadmap:{
        type:[String],
        default:[]
    },
   // -------- Resume -------- 
    resumeText:{
        type:String,
        default:""
    },

    
    
    
},{timestamps:true});

module.exports=mongoose.model("Resume",resumeSchema);