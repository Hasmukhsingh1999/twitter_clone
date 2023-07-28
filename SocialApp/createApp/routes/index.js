var express = require("express");
var router = express.Router();

const userModel = require("./users");
const postModel = require("./posts");
const passport = require("passport");
const multer = require("multer");
const path = require("path");
const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* MULTER ROUTE. */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    const getDate = new Date();
    const fn =
      getDate.getTime() +
      Math.floor(Math.random() * 100000) +
      path.extname(file.originalname);
    cb(null, fn);
  },
});

const upload = multer({ storage: storage });

/* FILEFILTER */
const fileFilter = function (req, file, cb) {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/svg+xml"
  ) {
    cb(null, true);
  } else {
    cb(new Error("I don't have a clue!"));
  }
};

/*UPLOAD */
router.post("/uploads", upload.single("image"), function (req, res) {
  userModel
    .findOne({ username: req.session.passport.user })
    .then((loggedUser) => {
      loggedUser.profileimage = req.file.filename;
      loggedUser.save().then(() => {
        res.redirect("/profile");
      });
    });
});

/* EDIT USERNAME */
router.post("/edit", async function (req, res) {
  try {
    const { firstname, lastname, username } = req.body;
    const user = await userModel.findById(req.user.id);
    user.firstname = firstname;
    user.lastname = lastname;
    user.username = username;

    await user.save();
    res.redirect("back");
  } catch (err) {
    err ? console.log(err) : res.redirect("/");
  }
});

/* HOME ROUTE(PROFILE) */
router.get("/profile", async function (req, res) {
  try {
    const users = await userModel.findOne({
      username: req.session.passport.user,
    });
    res.render("profile", { users: users });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

/*POST UPLOADS */
router.post("/upload-profile", async function (req, res, next) {
  const userCreate = await userModel.findOne({
    username: req.session.passport.user,
  });
  const { postDetails, user } = req.body;
  const postCreate = await postModel.create({
    postDetails,
    user,
  });
  userCreate.posts.push(postCreate._id);
  await userCreate.save();
  res.redirect("back");
  console.log(userCreate);
});

/* SHOW POSTS */
router.get("/showPost", async function (req, res) {
  const userFound = await userModel
    .findOne({ username: req.session.passport.user })
    .populate({ path: "posts", populate: { path: "user" } });
  // res.render("editProfile", { userFound: userFound });
  res.json({userFound: userFound})
  // console.log(userFound);
});

/* REGISTER ROUTE. */
router.post("/register", async function (req, res, next) {
  try {
    const { username, firstname, lastname, email, profileimage, password } =
      req.body;
    const newUser = new userModel({
      username,
      firstname,
      lastname,
      email,
      profileimage,
    });
    await userModel.register(newUser, password);
    passport.authenticate("local")(req, res, function () {
      res.redirect("/profile");
    });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

/* LOGIN ROUTE. */
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/",
  }),
  function (req, res) {}
);

router.get("/login", function (req, res, next) {
  res.render("login");
});

/* LOGOUT ROUTE. */
router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    } else {
      res.redirect("/");
    }
  });
});

/* MIDDLEWARE */
function isloggedin() {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/");
  }
}

/* REGISTERED MIDDLEWARE */
function isRegistered(req, res) {
  try {
    if (req.isAuthenticated()) {
      res.redirect("/profile");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log("Error during authentication: ", error);
    res.status(500).send("Internal Server Error");
  }
}

/* FINDALLUSER */
router.get("/user", async function (req, res) {
  const findAll = await userModel.find();
  res.json({ findAll: findAll });
});

/* DELETE USER */
router.get("/delete/:id", async function (req, res) {
  const deleteUser = await userModel.deleteOne();
  res.json({ deleteUser: deleteUser });
});

/* USERCHECK */
router.get("/show/:username", async function (req, res) {
  const regex = new RegExp("^" + req.params.username);
  const allUsers = await userModel.find({ username: regex });
  res.json({ allUsers: allUsers });
});

/* CHECK-USERS  */
router.get("/username/:username", async function (req, res) {
  const userFound = userModel.findOne({ username: req.params.username });
  if (userFound) {
    res.json({ found: true });
  } else {
    res.json({ found: false });
  }
});

module.exports = router;
