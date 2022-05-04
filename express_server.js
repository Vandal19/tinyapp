const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { restart } = require("nodemon");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
// This tells the Express app to use EJS as it templating engine.
app.set("view engine", "ejs");
app.use(cookieParser());

const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "admin": {
    id: "admin",
    email: "tinyAppAdmin@gmail.com",
    password: "Admin789"
  },
  "Bob": {
    id: "Bob",
    email: "Bob@gmail.com",
    password: "Qwerty987$"
  }
};

const ifEmailExists = (email, users) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  } return false;
};

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
  const templateVars = {
    urls: urlDatabase,
    userID: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    userID: req.cookies["user_id"],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
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

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get('/login', (req, res) => {
  const templateVars = {
    "user_id": req.cookies["user_id"],
    "user": users[req.cookies["user_id"]]
  };
  res.render("urls_login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

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
  if (!email || !password) {
    return res.status(400).send('Email or Password field cannot be empty. Please try again!');
  }
  if (ifEmailExists(email, users)) {
    return res.status(400).send('Email already exist, please try another email');
  }
  const user = {
    'id': userID,
    'email': email,
    'password': password,
  };
  users[userID] = user;
  res.cookie("user_id", userID);
  console.log(users);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


