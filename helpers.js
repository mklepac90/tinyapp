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

const returnUserID = (object, email) => {
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

module.exports = {

  generateRandomString,
  createUser,
  checkEmail,
  checkPassword,
  returnUserID,
  urlsForUser

};