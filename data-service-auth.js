const connectionString =
  "mongodb+srv://john:johndb@web322a6.lzwz2l2.mongodb.net/?retryWrites=true&w=majority";
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  userName: {
    type: String,
    unique: true,
  },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: Date,
      userAgent: String,
    },
  ],
});

let User;

module.exports.initialize = function () {
  return new Promise(function (resolve, reject) {
    let db = mongoose.createConnection(connectionString);

    db.on("error", (err) => {
      reject(err); // reject the promise with the provided error
    });
    db.once("open", () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
};

module.exports.registerUser = function (userData) {
  return new Promise(function (resolve, reject) {
    if (userData.password != userData.password2) {
      reject("Passwords do not match");
    } else {
      let newUser = new User(userData);

      bcrypt.hash(userData.password, 10).then((hash) => {
        userData.password = hash;
        let newUser = new User(userData);
        newUser
          .save()
          .then((response) => {
            resolve();
          })
          .catch((err) => {
            if (err.code == 11000) {
              reject("User Name already taken");
            } else {
              reject("There was an error creating the user: " + err);
            }
          });
      });
    }
  });
};

module.exports.checkUser = function (userData) {
  return new Promise(function (resolve, reject) {
    User.find({ userName: userData.userName })
      .exec()
      .then((users) => {
        if (!users.length) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt.compare(userData.password, users[0].password).then((flag) => {
            if (flag) {
              // Check if the loginHistory array exists
              if (!users[0].loginHistory) {
                users[0].loginHistory = [];
              }

              // Add the current datetime and machine info to the loginHistory array
              users[0].loginHistory.push({
                dateTime: new Date().toString(),
                userAgent: userData.userAgent,
              });

              // Update the user document in the database
              User.updateOne(
                { userName: users[0].userName },
                { $set: { loginHistory: users[0].loginHistory } }
              )
                .exec()
                .then(() => {
                  resolve(users[0]);
                })
                .catch((err) => {
                  reject(`There was an error verifying the user: ${err}`);
                });
            } else {
              reject(`Incorrect Password for user: ${userData.userName}`);
            }
          });
        }
      })
      .catch((err) => {
        console.log(`There was an error: ${err}`);
      });
  });
};
