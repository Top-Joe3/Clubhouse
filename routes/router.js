const router = require("express").Router();
const controllers = require("../controllers/controllers.js");
const passport = require("passport");

router.get("/", controllers.home);
router.get("/signup", controllers.signupGet);
router.get("/login", controllers.loginGet);
router.post("/signup", controllers.signupPost);
router.get("/dashboard", controllers.ensureAuth, controllers.dashboard);
router.post("/deleteJoke", controllers.deleteJokePost);
router.post("/addJoke", controllers.addJokePost);
router.post("/adminQuestion", controllers.adminQuestion);
router.post("/memberQuestion", controllers.memberQuestion);
router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      const errors = {};
      if (info.message.toLowerCase().includes("username")) {
        errors.username = { msg: info.message };
      } else if (info.message.toLowerCase().includes("password")) {
        errors.password = { msg: info.message };
      } else {
        errors.form = { msg: info.message };
      }
      return res.render("index", {
        title: "Clubhouse",
        errors,
        old: req.body,
        view: "./partials/login.ejs",
      });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect("/dashboard");
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
