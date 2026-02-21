const { body, validationResult, matchedData } = require("express-validator");
const queries = require("../db/queries");
const bcrypt = require("bcryptjs");

const home = async (req, res, next) => {
  const messages = await queries.getMessages();
  console.log(messages);
  res.render("index", {
    title: "Clubhouse",
    messages,
    errors: {},
    old: {},
    view: "./partials/homepage.ejs",
  });
};

const signupGet = (req, res, next) => {
  res.render("index", {
    title: "Clubhouse",
    errors: {},
    old: {},
    view: "./partials/signup.ejs",
  });
};

const loginGet = (req, res, next) => {
  res.render("index", {
    title: "Clubhouse",
    errors: {},
    old: {},
    view: "./partials/login.ejs",
  });
};

const validate = [
  body("fullname").trim().notEmpty().withMessage("Full name required"),
  body("nickname").trim().notEmpty().withMessage("Username is required"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 7 })
    .withMessage("Password must be at least 7 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[^A-Za-z0-9]/)
    .withMessage("Password must contain at least one symbol"),
  body("confirmPassword")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Password doesn't match"),
];

const signupPost = [
  validate,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("index", {
        title: "Clubhouse",
        errors: errors.mapped(),
        old: req.body,
        view: "./partials/signup.ejs",
      });
    }
    const result = matchedData(req);
    const hashPassword = await bcrypt.hash(result.password, 10);
    try {
      await queries.addUser([result.fullname, result.nickname, hashPassword]);
    } catch (error) {
      if (error.code === "23505") {
        console.log(error.code);
        return res.render("index", {
          title: "Clubhouse",
          errors: {
            nickname: { msg: "Nickname already taken!" },
          },
          old: req.body,
          view: "./partials/signup.ejs",
        });
      }
      return next(error);
    }
    res.redirect("/login");
  },
];

function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

const dashboard = async (req, res, next) => {
  try {
    const messages = await queries.getMessages();
    res.render("index", {
      title: "Clubhouse",
      messages,
      view: "./partials/dashboard.ejs",
      errors: {},
      old: {},
    });
  } catch (error) {}
};

const deleteJokePost = async (req, res, next) => {
  try {
    const jokeId = req.body.jokeId;
    await queries.deleteJoke(jokeId);
    res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

const validateJoke = body("joke")
  .trim()
  .notEmpty()
  .withMessage(
    "Are you joking? You didn't write any joke yet you want to submit",
  );

const addJokePost = [
  validateJoke,
  async (req, res, next) => {
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        const messages = await queries.getMessages();
        return res.render("index", {
          title: "Clubhouse",
          messages,
          errors: errors.mapped(),
          old: req.body,
          view: "./partials/dashboard",
        });
      }
      const fields = [req.user.id, req.body.joke];
      await queries.addJoke(fields);
      res.redirect("/dashboard");
    } catch (error) {
      next(error);
    }
  },
];

const validateAdminQuestion = body("oolscay")
  .trim()
  .notEmpty()
  .withMessage("You didnt provide any answer")
  .toLowerCase();

const validateMemberQuestion = body("pattern")
  .notEmpty()
  .withMessage("You didnt provide any answer")
  .isInt()
  .withMessage("Input must be digit")
  .toInt();

const adminQuestion = [
  validateAdminQuestion,
  async (req, res, next) => {
    try {
      if (req.user.admin) {
        return res.redirect("/dashboard");
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = await queries.getMessages();
        return res.render("index", {
          title: "Clubhouse",
          messages,
          errors: errors.mapped(),
          old: req.body,
          view: "./partials/dashboard.ejs",
        });
      }

      const input = matchedData(req).oolscay;
      if (input === "school") {
        await queries.admin(req.user.id);
      }
      res.redirect("/dashboard");
    } catch (error) {
      next(error);
    }
  },
];

const memberQuestion = [
  validateMemberQuestion,
  async (req, res, next) => {
    try {
      if (req.user.member) {
        return res.redirect("/dashboard");
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const messages = await queries.getMessages();
        return res.render("index", {
          title: "Clubhouse",
          messages,
          errors: errors.mapped(),
          old: req.body,
          view: "./partials/dashboard.ejs",
        });
      }

      const input = matchedData(req).pattern;
      if (input === 67) {
        await queries.member(req.user.id);
      }
      res.redirect("/dashboard");
    } catch (error) {
      next(error);
    }
  },
];

module.exports = {
  home,
  signupGet,
  loginGet,
  signupPost,
  ensureAuth,
  dashboard,
  deleteJokePost,
  addJokePost,
  adminQuestion,
  memberQuestion,
};
