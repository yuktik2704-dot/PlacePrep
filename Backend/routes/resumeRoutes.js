const express=require("express");
const router=express.Router();

const upload=require("../config/multer");

const{
    uploadResume,
    getAllResumes,    
    getResumeById,
    updateResume,
    deleteResume
}=require("../controllers/resumeController");

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/",getAllResumes);
router.get("/:id", getResumeById);

router.put("/:id", updateResume);
router.delete("/:id", deleteResume);

module.exports=router;
