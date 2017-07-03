const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    name: {
        type: String,

        required: true,
        trim: true
    },
    favoriteBook: {
        type: String,

        required: true,
        trim: true
    },
    password: {
        type: String,

        required: true

    }

});
//authenticate input against database docs
UserSchema.statics.authenticate = function(email, password, callback) {
    User.findOne({ email: email }).exec(function(error, user) {
        if (error) {
            return callback(error);
        } else if (!user) {
            let err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function(error, result) {
            if (result === true) {
                return callback(null, user);
            } else {
                return callback();
            }
        })
    });
}

// UserSchema.methods.comparePassword = function(attemptedPassword, callback) {
//     bcrypt.compare(attemptedPassword, this.password, function(err, isMatch) {
//         callback(isMatch);
//     });
// };
//Hash password befor saving to db
UserSchema.pre('save', function(next) {
    let user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(10, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });


});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
let User = mongoose.model('User', UserSchema);
module.exports = User;