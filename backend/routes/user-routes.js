const express = require('express')
const HttpError = require('../models/http-error')
const usersController = require('../controllers/users-controller')
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload')


router = express.Router()


router.get('/', usersController.getUsers)

router.post('/signup',
    fileUpload.single('image'),
    [
        check('name').not().isEmpty(),
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({ min: 5 }),
    ]
    ,
    usersController.signup)

router.post('/login', usersController.login)





module.exports = router