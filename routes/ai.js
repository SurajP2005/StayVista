const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware.js");

const aiController = require("../controllers/ai.js");

// Show AI Planner Page
router.get(
    "/",
    isLoggedIn,
    aiController.renderPlanner
);

// Generate AI Trip Plan
router.post(
    "/",
    isLoggedIn,
    aiController.generateTrip
);

module.exports = router;