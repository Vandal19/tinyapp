const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "steve"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "bob"
  }
};

const users = {
  "steve": {
    id: "steve",
    email: "steve24@gmail.com",
    password: "$2a$10$ES0ws8Rxk7NpXhu8cLc6zuULDbmYFSzpDNr7OYkJxnf1JsD8J4H7."
  },
  "bob": {
    id: "bob",
    email: "Bob@gmail.com",
    password: "$2a$10$ES0ws8Rxk7NpXhu8cLc6zuULDbmYFSzpDNr7OYkJxnf1JsD8J4H7."
  }
};
console.log(users);

module.exports = { users, urlDatabase };