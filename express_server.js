// Setup
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
//------------------------------------------------------------------------------
// Global functions
function generateRandomString(length) {
  return Math.random().toString(36).substring(2, (length + 2));
};

const createUser = (userDB, id, email, password) => {
  userDB[id] = {
    id,
    email,
    password
  }
};

const checkEmail = (object, email) => {
  for (let key in object) {
    if (object[key].email === email) {
      return true;
    }
  }
  return false;
};

const checkPassword = (object, email) => {
  for (let key in object) {
    if (object[key].email === email) {
      return object[key].password;
    }
  }
};

const returnUser = (object, email) => {
  for (let key in object) {
    if (object[key].email === email) {
      return object[key].id;
    }
  }
  return false;
};
//------------------------------------------------------------------------------
// "Databases"
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {


};
///------------------------------------------------------------------------------
// Login/Logout
app.get("/login", (req, res) => {
  // res.cookie('user_id', users["user_id"]);
  res.render("login");
});

app.post("/login", (req, res) => {
  if (!checkEmail(users, req.body.email)) {
    return res.sendStatus(403);
  }
  if (checkEmail(users, req.body.email) && checkPassword(users, req.body.email) !== req.body.password) {
    return res.sendStatus(403);
  }
  if (checkEmail(users, req.body.email) && checkPassword(users, req.body.email) === req.body.password) {
    const user_id = returnUser(users, req.body.email);
    res.cookie('user_id', user_id);
    res.redirect('/urls');
  }  
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});
///------------------------------------------------------------------------------
// User Registration
app.get("/register", (req, res) => {
  res.render("registrationForm");
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.sendStatus(400);
  } else if (checkEmail(users, req.body.email)) {
    return res.sendStatus(400);
  } else {
    const user_id = generateRandomString(6);
    createUser(users, user_id, req.body.email, req.body.password);
    // console.log(users);
    res.cookie("user_id", user_id);
    res.redirect("/urls");
  }
});
//------------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//------------------------------------------------------------------------------
