const express = require("express");
const { register, login, isLogin, google_login, google_signup } = require("../controllers/auth.js");
const { isAuthenticated } = require("../controllers/auth.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/isLogin", isAuthenticated, isLogin);
router.post('/google-login', google_login );
router.post('/google-signup', google_signup);

module.exports = router; 
