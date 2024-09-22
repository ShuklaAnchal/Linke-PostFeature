var express = require('express');
var router = express.Router();
var userModle = require('./users');
var postModle = require('./posts');
const passport = require('passport');
const localStrategy = require('passport-local')
var path = require('path')
const axios = require('axios');

// //multer js
var multer = require('multer')

passport.use(new localStrategy(userModle.authenticate()));
passport.use(userModle.createStrategy())

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/uploads");
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var rn = Math.floor(Math.random() * 100000000) + dt.getTime() + path.extname(file.originalname);
    cb(null, rn);
  },
});

function fileFilter(req, file, cb) {
  console.log(file.mimetype);
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/svg"
  ) {
    cb(null, true);
  }
  // You can always pass an error if something goes wrong:
  else {
    cb(new Error("Only images are allowed"), false);
  }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.get('/register', function (req, res, next) {
  res.render('register');
});

// router.post('/create', function(req, res, next) {
//    userModle.create({
//     name:req.body.name,
//     email:req.body.email,
//     mobnumber:req.body.mobnumber,
//     image:req.body.image,
//     password:req.body.password
//    }).then(function(registred){
//     // res.send(registred);
//     res.redirect("feed");
//    })
// });

// passport js for set the password


//create account

router.post('/register', upload.single('image'), function (req, res, next) {
  var newUser = new userModle({
    username: req.body.username,
    email: req.body.email,
    mobnumber: req.body.mobnumber
  })
  userModle.register(newUser, req.body.password)
    .then(function (registred) {
      passport.authenticate('local')(req, res, function () {
        res.redirect("/profile")
      })
    })
})


router.post("/upload", isLoggedIn, upload.single("image"), function (req, res, next) {
  console.log(req.session.passport.user)
  userModle.findOne({ email: req.session.passport.user })
    .then(function (loggedInUser) {
      console.log(loggedInUser)
      console.log(req.file);
      console.log(req.body);
      loggedInUser.image = req.file.filename;
      loggedInUser.save().then(function (dets) {
        console.log("dets --->>> ", dets);
        res.redirect("back");
      });
    });
}
);

//login page

router.post('/login', passport.authenticate('local', {
  successRedirect: "/profile",
  failureRedirect: '/'
}), function (req, res, next) {
});


//profile page
router.get('/profile', isLoggedIn, function (req, res, next) {
  userModle.findOne({ email: req.session.passport.user })
    .then(function (val) {
      res.render("profile", { val })
    })
})
router.get('/oneUser/:id', isLoggedIn, function (req, res, next) {
  userModle.findOne({ _id: req.params.id }).then(function (val) {
    res.render("profile", { val })
  })
})

// router.get('/profile', isLoggedIn, function(req, res, next){
//   userModle,postModle.findOne({email:req.session.passport.user})
//   .populate({
//     path:'posts',
//     populate:{
//       path:'users'
//     }
//   })
// })



//logout page
router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

//loggedln middlewere

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/login');
  }
}

function reDricet(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/profile');
  }
  else {
    return next();
  }
}

//all users

router.get('/feed', function (req, res, next) {
  userModle.find().then(function (allusers) {
    res.render('feed', { allusers });
  })
});

// router.get('/like/:id', function(req, res, next){
//   userModle.findOne({_id: req.params.id}).then(function(user){
//     user.like++;
//     user.save()
//     .then(function(userlike){
//       res.redirect("back");
//     })
//   })
// })

//like user

router.get('/like/:id', isLoggedIn, function (req, res, next) {
  userModle.findOne({ _id: req.params.id }).then(function (user) {
    user.like.push(req.session.passport.user);
    user.save()
      .then(function () {
        res.redirect("back")
      })
  })
})



// router.get("/like/:id", (req, res) => {
//   const postId = req.params.id;
//   userModle.findOne({ _id: postId }).then((post) => {
//     const userId = req.params._id;
//     if (post.likes.includes(userId)) {
//       const getUserIdIndex = post.likes.indexOf(userId);
//       post.likes.splice(getUserIdIndex, 1);
//     } else {
//       post.likes.push(userId);
//     }
//     post.save().then(() => {
//       res.redirect("back");
//     });
//   });
// });



//follow user
router.get('/follow/:id', function (req, res, next) {
  userModle.findOne({ _id: req.params.id }).then(function (user) {
    user.follow++;
    user.save()
      .then(function (userfollowed) {
        res.redirect("back");
      })
  })
})

//post route

router.post('/post', isLoggedIn, async function (req, res, next) {
  var loggedInUser = await userModle.findOne({ email: req.session.passport.user });
  var posted = await postModle.create({ postdets: req.body.postdets, email: loggedInUser, users: loggedInUser._id });

  loggedInUser.posts.push(posted.loggedInUser_id);
  await loggedInUser.save();
  res.redirect("back")
})


router.get("/postss", function (req, res) {
  postModle.find()
    .populate("users")
    .then(function (allposts) {
      console.log(allposts)
      res.render("postss", { allposts });
    });
});


//Search User
router.post('/searchUser', function (req, res, next) {
  console.log(req.body)
  var result = req.body.result
  userModle.find({
    username: { $regex: result }
  }).then(function (users) {
    res.json({ users });
  }).catch(err => {
    console.log(err)
  })
})





// router.get('/profile', function(req, res, next){
//   userModle.find().then(function(allusers){
//     res.render('profile', {allusers});
// })
// })


// router.get('/read', function(req, res, next){
//   userModle.find().then(function(val){
//     res.send('read')
//   })
// })
module.exports = router;
