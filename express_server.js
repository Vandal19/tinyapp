const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { restart } = require("nodemon");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true }));
// This tells the Express app to use EJS as it templating engine.
app.set("view engine", "ejs");
app.use(cookieParser());

const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "admin"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "bob"
  }
};

const users = {
  "admin": {
    id: "admin",
    email: "tinyAppAdmin@gmail.com",
    password: "$2a$10$ES0ws8Rxk7NpXhu8cLc6zuULDbmYFSzpDNr7OYkJxnf1JsD8J4H7."
  },
  "bob": {
    id: "bob",
    email: "Bob@gmail.com",
    password: "$2a$10$ES0ws8Rxk7NpXhu8cLc6zuULDbmYFSzpDNr7OYkJxnf1JsD8J4H7."
  }
};
console.log(users);


const getUserInfo = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  } return false;
};

const urlsForUser = (userID, urlDatabase) => {
  const userURL = {};
  for (let url in urlDatabase) {
    // console.log("url", url)
    if (urlDatabase[url].userID === userID) {
      userURL[url] = urlDatabase[url];
      console.log("url", url);
    }
  } return userURL;
};

app.get("/register", (req, res) => {
  const templateVars = {
    "user_id": req.cookies["user_id"],
    "user": users[req.cookies["user_id"]]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !password) {
    return res.status(400).send('Email or Password field cannot be empty. Please try again!');
  }
  const newUser = {
    'id': userID,
    'email': email,
    'password': hashedPassword,
  };
  if (getUserInfo(email, newUser)) {
    return res.status(400).send('Email already exist, please try another email')
  }
  users[userID] = newUser;
  res.cookie("user_id", userID);
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  const templateVars = {
    "user_id": req.cookies["user_id"],
    "user": users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserInfo(email, users);
  if (!user) {
    return res.status(403).send('Email does not exist, please check again or sign up this new email');
  }
  // console.log(bcrypt.hashSync("Qwerty987$", 10));
  if (bcrypt.compare(password, user.password)) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
    return;
  } else {
    return res.status(403).send('Incorrect password, please try again!');
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[userID];
  if (!user) {
    return res.status(400).send("You are not logged in, please login first");
  } else {
    const templateVars = {
      user: users[userID],
      urls: urlsForUser(userID, urlDatabase)
    };
    // console.log("checkDatabase", urlsForUser("bob", urlDatabase));
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    const templateVars = {
      urls: urlDatabase,
      userID: req.cookies["user_id"],
      user: users[req.cookies["user_id"]]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    userID: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL]['longURL'];
    res.redirect(longURL);
  } else {
    res.status(400).send("ID does not exist, please check!");
  }
});

app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect("/urls");
  }
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user_id"];
  if (!userID) {
    res.status(403).send("You are not logged in");
  } else {
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID
    };
    res.redirect("urls_index");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user_id"];
  if (userID !== urlDatabase[shortURL].userID) {
    res.status(403).send("You are not logged in");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


