const express = require("express");
const router = express.Router();
const auth = require("../auth.js");
const path = require("path");
const CP = require("node:child_process");


// A plain GET will give the login page
router.get("/login", (req, res) => {
   res.sendFile(path.join(__dirname, "../public/login.html"));
});

// POST for getting the cookie
router.post("/login", (req, res) => {
   // Check the username and password
   console.log(req.body);
   const { username, password } = req.body;
   const token = auth.generateAccessToken(username, password);

   if (!token) {
      console.log("Unsuccessful login by user", username);
      return res.sendStatus(403);
   }

   console.log("Successful login by user", username);

   // Store the token in a cookie so that later requests will have it
   res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Strict",
   });

   // Web client gets redirected to / after successful login
   res.redirect("/");
});

// Log out by deleting token cookie.  Redirect back to login.
router.get("/logout", auth.authenticateCookie, (req, res) => {
   console.log("Logout by user", req.user.username);
   res.clearCookie("token");
   res.redirect("/login");
});

router.post("/upload", (req, res) => {
   // input name in index.html is "uploadFile"
   file = req.files.uploadFile;

   // just using the filename as uploaded, but would be better
   // to have a guaranteed unique name
   const uploadPath = path.join(__dirname, "../uploads", file.name);
   
   file.mv(uploadPath, (err) => {
      // Basic error handling
      if (err) {
         return res.status(500).send(err.message);
      }

      // Simple demonstration of exec()
      CP.exec(`cp ${uploadPath} ${uploadPath}-copy`);

   });

   
   res.sendFile(path.join(__dirname, "../public/upload.html"));
});

// Serve up static files if they exist in public directory, protected by authentication middleware
router.use("/", auth.authenticateCookie, express.static(path.join(__dirname, "../public")));

module.exports = router;
