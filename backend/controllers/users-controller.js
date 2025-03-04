const { v4 } = require('uuid')
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs')
const HttpError = require('../models/http-error');
const User = require('../models/user');
const jwt = require('jsonwebtoken')



const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Max Schwarz',
        email: 'test@test.com',
        password: 'testers'
    }
];



exports.getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch (err) {
        const error = new HttpError(
            'Fetching users failed, please try again later.',
            500
        );
        return next(error);
    }
    res.json({ users: users.map(user => user.toObject({ getters: true })) });
};




// // with Dummy data
// exports.getUsers = (req, res, next) => {
//     res.json({ users: DUMMY_USERS })
// }

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }
    const { name, email, password } = req.body;

    let existingUser
    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        console.log(err)
        const error = new HttpError(
            'Signing up failed, please try again later.',
            500
        );
        return next(error);
    }

    if (existingUser) {
        const error = new HttpError(
            'User exists already, please login instead.',
            422
        );
        return next(error);
    }

    let hashedPassword

    try {
        hashedPassword = await bcrypt.hash(password, 12)

    } catch (err) {
        console.log('user-controller/signup/ inside catch error for hashing a pawwrord ===', err)
        const error = new HttpError('Could not able to create a user, please try later!', 500)
        return next(error)
    }

    const createdUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    try {
        await createdUser.save();
    } catch (err) {
        console.log('error inside second trycatch = ', err)

        const error = new HttpError(
            'Signing up failed, please try again.',
            500
        );
        return next(error);
    }

    let token
    try {
        console.log('users-contoller/signup/ JWT expires date === ', process.env.JWT_EXPIRE_IN)
        // console.log('users-contoller/signup/ JWT secret key === ', process.env.JWT_SECRET)
        token = jwt.sign(
            { userId: createdUser.id, email: createdUser.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_IN }
        )

    } catch (err) {
        console.log('user-controller/signup/ inside catch error for token===', err)
        const error = new HttpError('Signing up is failed, please try agian later!', 500)
        return next(error)
    }

    // res.status(201).json({ user: createdUser.toObject({ getters: true }) });
    res
        .status(201)
        .json({ userId: createdUser.id, email: createdUser.email, token });
};


// // DUMMY SIGNUP
// exports.signup = (req, res, next) => {
//     const { name, email, password } = req.body

//     const hasUser = DUMMY_USERS.find(u => u.email === email)
//     if (hasUser) {
//         throw new HttpError('COuld not create user, email already exists', 422)
//     }

//     const createUser = {
//         id: v4(), name, email, password
//     }

//     DUMMY_USERS.push(createUser)

//     res.status(201).json({ user: createUser })
// }

exports.login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingUser;

    try {
        existingUser = await User.findOne({ email: email })
    } catch (err) {
        const error = new HttpError(
            'Logging in failed, please try again later.',
            500
        );
        return next(error);
    }

    if (!existingUser) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            401
        );
        return next(error);
    }

    let isValidPassword = false
    try {

        isValidPassword = await bcrypt.compare(password, existingUser.password)
    } catch (err) {
        console.log('user-controller/login/ inside catch error for camparing a pawwrord ===', err)
        const error = new HttpError('Could not log you in, please check your  credentials and try again!', 500)
        return next(error)
    }
    if (!isValidPassword) {
        const error = new HttpError(
            'Invalid credentials, could not log you in.',
            401
        );
        return next(error);
    }

    let token
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_IN }
        )

    } catch (err) {
        console.log('user-controller/signup/ inside catch error for token===', err)
        const error = new HttpError('Logging in is failed, please try agian later!', 500)
        return next(error)
    }

    // res.json({ message: 'Logged in!', user: existingUser.toObject({ getters: true }) });
    res
        .status(200)
        .json({ userId: existingUser.id, email: existingUser.email, token });

};

// // DUMMY SIGNUP
// exports.login = (req, res, next) => {
//     const { email, password } = req.body
//     const identifiedUser = DUMMY_USERS.find(u => u.email === email)

//     if (!identifiedUser || !identifiedUser.password !== password) {
//         throw new HttpError('Could not identify user', 401)
//     }

//     res.json({ message: 'logged in' })

// }