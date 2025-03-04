const express = require('express')
const HttpError = require('../models/http-error')
const placesController = require('../controllers/places-controller')
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth')


router = express.Router()


router.get('/:pid', placesController.getPlaceById)
router.get('/user/:uid', placesController.getPlacesByUserId)


// Below path should have  authentication
router.use(checkAuth)


router.post('/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address').not().isEmpty(),
    ]
    , placesController.createPlace)


router.patch('/:pid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({ min: 5 }),
    ]
    , placesController.updatePlace)

router.delete('/:pid', placesController.deletePlace)




module.exports = router