//------------------------------------------------------------------------------
// Setup
const express = require('express');
const app = express();
const PORT = 8080;

const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const bcrypt = require('bcrypt');

app.set('view engine', 'ejs');
//------------------------------------------------------------------------------
// Helper functions
const { generateRandomString } = require('./helpers');
const { createUser } = require('./helpers');
const { checkEmail } = require('./helpers');
const { checkPassword } = require('./helpers');
const { returnUserID } = require('./helpers');
const { urlsForUser } = require('./helpers');
//------------------------------------------------------------------------------
// "Databases"
const urlDatabase = {
  'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'aJ48lW' },
  '9sm5xK': { longURL: 'http://www.google.com', userID: 'aJ48lW' }
};

const users = {

};
///------------------------------------------------------------------------------
// Login/Logout
app.get('/login', (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render('login', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post('/login', (req, res) => {
  if (!checkEmail(users, req.body.email)) {
    return res.sendStatus(403);
  }
  if (checkEmail(users, req.body.email) && !bcrypt.compareSync(req.body.password, checkPassword(users, req.body.email))) {
    return res.sendStatus(403);
  }
  if (checkEmail(users, req.body.email) && bcrypt.compareSync(req.body.password, checkPassword(users, req.body.email))) {
    const user_id = returnUserID(users, req.body.email);
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});
///------------------------------------------------------------------------------
// User Registration
app.get('/register', (req, res) => {
  if (!req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render('registrationForm', templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.post('/register', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.sendStatus(400);
  } else if (checkEmail(users, req.body.email)) {
    return res.sendStatus(400);
  } else {
    const user_id = generateRandomString(6);
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    createUser(users, user_id, req.body.email, hashedPassword);
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});
//------------------------------------------------------------------------------
//  Root Route
app.get('/', (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});
//------------------------------------------------------------------------------
// /URL GET Routes
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls', (req, res) => {
  if (!req.session.user_id) {
    res.send('<html><body>Access denied: Please <a href="/register">register</a> or <a href="/login">login</a> to view this resource</body></html>\n');
  } else {
    // Logged in user only sees URLs associated with their user_id
    const urlDatabaseF = urlsForUser(urlDatabase, req.session.user_id);
    const templateVars = { urls: urlDatabaseF, user: users[req.session.user_id] };
    res.render('urls_index', templateVars);
  }
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    res.render('urls_new', templateVars);
  }
});

app.get('/urls/:shortURL', (req, res) => {
  if (!req.session.user_id) {
    return res.send('<html><body>Access denied: Please <a href="/register">register</a> or <a href="/login">login</a> to view this resource</body></html>\n');
  }
    
  const urlDatabaseF = urlsForUser(urlDatabase, req.session.user_id);
  
  if (Object.keys(urlDatabaseF).includes(req.params.shortURL)) {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    res.render('urls_show', templateVars);
  } else {
    res.send('<html><body>Access denied: Resource does not belong to this user. Please <a href="/login">login</a> to view this resource</body></html>\n');
  }
});

app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.send('<html><body>Provided TinyURL is invalid. Please <a href="/login">login</a> to create this resource.</body></html>\n');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});
//------------------------------------------------------------------------------
// /URL POST Routes
app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    return res.send('<html><body>Access denied: Please <a href="/register">register</a> or <a href="/login">login</a> to access this resource</body></html>\n');
  } else {
    const shortURL = generateRandomString(6);
    urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const urlDatabaseF = urlsForUser(urlDatabase, req.session.user_id);
  if (Object.keys(urlDatabaseF).includes(req.params.shortURL)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.send('<html><body>Access denied: Resource does not belong to this user. Please <a href="/login">login</a> to delete this resource</body></html>\n');
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  const urlDatabaseF = urlsForUser(urlDatabase, req.session.user_id);
  if (Object.keys(urlDatabaseF).includes(req.params.shortURL)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.send('<html><body>Access denied: Resource does not belong to this user. Please <a href="/login">login</a> to edit this resource</body></html>\n');
  }
});
//------------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//------------------------------------------------------------------------------
