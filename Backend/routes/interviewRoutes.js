const express = require("express");

const router = express.Router();

const {

    startInterview,
    evaluateInterviewController

} = require("../controllers/interviewController");

router.get(

    "/start/:id",

    startInterview

);

router.post(

    "/evaluate",

    evaluateInterviewController

);

module.exports = router;