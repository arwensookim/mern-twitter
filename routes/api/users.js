const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require('passport');

const User = require("../../models/User");
const keys = require("../../config/keys");



const validateRegisterInput = require('../../validation/register');
const validateLoginInput = require('../../validation/login');


router.get("/test", (req, res) => {
    res.json({msg: "This is the user route"});
});

// You may want to start commenting in information about your routes so that you can find the appropriate ones quickly.
router.get('/current', passport.authenticate('jwt', {session: false}), (req, res) => {
    res.json({
        id: req.user.id,
        handle: req.user.handle,
        email: req.user.email
    });
  })

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    User.findOne({ handle: req.body.handle })
        .then(user => {
            if (user) {
                errors.handle = "User already exists";
                return res.status(400).json(errors)
            } else {
                const newUser = new User({
                    handle: req.body.handle,
                    email: req.body.email,
                    password: req.body.password
                })

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => {
                                // const payload = { id: user.id, handle: user.handle };
                                
                                // jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token => {
                                //     res.json({
                                //         success: true,
                                //         token: "bearer " + token
                                //     });
                                // }));
                                res.json(user)
                            })
                            .catch(err => console.log(err))
                    })
                })

                // newUser.save()  // this is just for testing. take this out!!
                //     .then(user => res.send(user)) // take this out!!
                //     .catch(err => res.send(err)); // take this out!!
            }
        })
})

router.post('/login', (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    if(!isValid) {
        return res.status(400).json(errors);
    }

    const handle = req.body.handle;
    const password = req.body.password;

    User.findOne({ handle })
        .then(user => {
            if(!user) {
                errors.handle = "This user does not exist"
                return res.status(404).json(errors);
            }

            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(isMatch) {
                        // res.json({ msg: "Success!" })
                        const payload = {
                            id: user.id,
                            handle: user.handle
                        };

                        jwt.sign(
                            payload,
                            keys.secretOrKey,
                            { expiresIn: 3600 },
                            (err, token) => {
                                res.json({
                                    success: true,
                                    token: "Bearer " + token
                                });
                            });
                    } else {
                        errors.password = "Incorrect password"
                        return res.status(400).json(errors);
                    }
                })
        })
})

module.exports = router;