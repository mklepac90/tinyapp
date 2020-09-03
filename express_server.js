// Setup
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcrypt');
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

const urlsForUser = (object, id) => {
  const copiedObject = JSON.parse(JSON.stringify(object));
  for (const key in copiedObject) {
    if (copiedObject[key].userID !== id) {
      delete copiedObject[key];
    }
  }

  return copiedObject;

};
//------------------------------------------------------------------------------
// "Databases"
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "aJ48lW" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "aJ48lW" }
};

const users = {


};
///------------------------------------------------------------------------------
// Login/Logout
app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  if (!checkEmail(users, req.body.email)) {
    return res.sendStatus(403);
  }
  if (checkEmail(users, req.body.email) && !bcrypt.compareSync(req.body.password, checkPassword(users, req.body.email))) {
    return res.sendStatus(403);
  }
  if (checkEmail(users, req.body.email) && bcrypt.compareSync(req.body.password, checkPassword(users, req.body.email))) {
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
  let templateVars = { user: users[req.cookies["user_id"]] };
  res.render("registrationForm", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.sendStatus(400);
  } else if (checkEmail(users, req.body.email)) {
    return res.sendStatus(400);
  } else {
    const user_id = generateRandomString(6);
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    createUser(users, user_id, req.body.email, hashedPassword);
    console.log(users);
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
  if (!req.cookies["user_id"]) {
    res.send('<html><body>Access denied: Please <a href="/register">register</a> or <a href="/login">login</a> to view this resource</body></html>\n');
  } else {
    const urlDatabaseF = urlsForUser(urlDatabase, req.cookies["user_id"]);
    let templateVars = { urls: urlDatabaseF, user: users[req.cookies["user_id"]] };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] };
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.send('<html><body>Access denied: Please <a href="/register">register</a> or <a href="/login">login</a> to view this resource</body></html>\n');
  }
    
  const urlDatabaseF = urlsForUser(urlDatabase, req.cookies["user_id"]);
  
  // if shortURL (key) isn't present in urlDatabaseF then do not render. Instead res.send <html><body> Access denied: resource not owned by this user
  if (Object.keys(urlDatabaseF).includes(req.params.shortURL)) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]] };
    res.render("urls_show", templateVars);
  } else {
    res.send('<html><body>Access denied: Resource does not belong to this user. Please <a href="/login">login</a> to view this resource</body></html>\n')
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.cookies["user_id"] };
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlDatabaseF = urlsForUser(urlDatabase, req.cookies["user_id"]);
  if (Object.keys(urlDatabaseF).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('<html><body>Access denied: Resource does not belong to this user. Please <a href="/login">login</a> to delete this resource</body></html>\n')
  }
});

app.post("/urls/:shortURL/update", (req, res) => {
  const urlDatabaseF = urlsForUser(urlDatabase, req.cookies["user_id"]);
  if (Object.keys(urlDatabaseF).includes(req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('<html><body>Access denied: Resource does not belong to this user. Please <a href="/login">login</a> to edit this resource</body></html>\n')
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//------------------------------------------------------------------------------
