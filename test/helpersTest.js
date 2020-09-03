const { assert } = require('chai');

const { checkEmail } = require('../helpers.js');
const { returnUserID } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('checkEmail', function() {
  it('should return true if email is associated with existing user', function() {
    const emailExists =  checkEmail(testUsers,"user@example.com")
    const expectedOutput = true;
    assert.strictEqual(emailExists, expectedOutput, 'provided email is associated with existing user');
  });

  it('should return false if email is NOT associated with existing user', function() {
    const emailExists =  checkEmail(testUsers,"user3@example.com")
    const expectedOutput = false;
    assert.strictEqual(emailExists, expectedOutput, 'provided email is NOT associated with existing user');
  });
});

describe('returnUserID', function() {
  it('should return a user with valid email', function() {
    const user = returnUserID(testUsers, "user@example.com");
    const expectedOutput = "userRandomID";
    assert.strictEqual(user, expectedOutput, 'provided email belongs to existing user');
  });

  it('should return false if no user associated with provided email', function() {
    const user = returnUserID(testUsers, "user3@example.com");
    const expectedOutput = false;
    assert.strictEqual(user, expectedOutput, 'no user associated with provided email');
  });
});

