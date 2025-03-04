const HttpError = require('../models/http-error')
const { v4 } = require('uuid')
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location')
const Place = require('../models/place');
const User = require('../models/user');
const mongoose = require('mongoose');
const fs = require('fs')

// let DUMMY_PLACES = [
//     {
//         id: 'p1',
//         title: 'Empire State Building',
//         description: 'One of the most famous sky scrapers in the world!',
//         location: {
//             lat: 40.7484474,
//             lng: -73.9871516
//         },
//         address: '20 W 34th St, New York, NY 10001',
//         creator: 'u1'
//     }
// ];


exports.createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { title, description, address, creator } = req.body;

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (error) {
        return next(error);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path,
        creator
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        const error = new HttpError('Creating place failed, please try again', 500);
        return next(error);
    }

    if (!user) {
        const error = new HttpError('Could not find user for provided id', 404);
        return next(error);
    }

    console.log(user);

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};
// // With Dummy-data
// exports.createPlace = async (req, res, next) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty) {
//         console.log('place-controller/createPlaces/errors = ', errors)
//         // when we work with ASYNC function, we have to use, next, throw an error wouldnt work
//         next(new HttpError('Invalid inputs passed, please check your data', 422))
//     }

//     const { title, description, address, creator } = req.body

//     let coordinates
//     // convert address to latitue & logititude coordinates
//     try {
//         coordinates = await getCoordsForAddress(address)
//     } catch (error) {
//         return next(error)
//     }

//     const createdPlace = {
//         id: v4(), title, description, location: coordinates, address, creator
//     }
//     DUMMY_PLACES.push(createdPlace) // or unshift(createdPlace)
//     res.status(201).json({ place: createdPlace })

// }



exports.getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.',
            500
        );
        return next(error);
    }

    if (!place) {
        const error = new HttpError(
            'Could not find a place for the provided id.',
            404
        );
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) });
};
// // With Dummy Data
// exports.getPlaceById = (req, res, next) => {
//     const placeId = req.params.pid
//     const place = DUMMY_PLACES.find(p => { return p.id === placeId })
//     console.log('Get request in places')

//     if (!place) {
//         // 3rd approach to handling an error
//         const error = new HttpError('Could not find a place for the provided id', 404)

//         // // 2nd apprach to handling an error
//         // const error = new Error('Could not find a place for the provided id')
//         // error.code = 404
//         // return next(error)

//         // // 1st apprach to handling an error
//         // return res.status(404).json({ message: 'Could not find a place for the provided id' })
//     }

//     res.json({
//         message: 'it works',
//         place: place
//     })
// }

exports.updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }

    if (place.creator.toString() !== req.userData.userId) {
        const error = new HttpError('You are not allowed to edit this place.', 401)
        return next(error);

    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError('Something went wrong, could not update place.', 500);
        return next(error);
    }

    res
        .status(200)
        .json({ place: place.toObject({ getters: true }) });
};
// // with Dummy data
// exports.updatePlace = (req, res, next) => {
//     const errors = validationResult(req)
//     if (!errors.isEmpty) {
//         console.log('place-controller/createPlaces/errors = ', errors)
//         throw new HttpError('Invalid inputs passed, please check your data', 422)
//     }

//     const { title, description } = req.body
//     const placeId = req.params.pid

//     const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) }
//     const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId)
//     updatedPlace.title = title
//     updatedPlace.description = description

//     DUMMY_PLACES[placeIndex] = updatedPlace

//     res.status(200).json({ place: updatedPlace })


// }


exports.deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    } catch (err) {
        console.log('controller/places-controller/deletePlace/1st catch error===', err)
        const error = new HttpError(
            'Something went wrong, could not delete place.',
            500
        );
        return next(error);
    }

    if (!place) {
        console.log('controller/places-controller/deletePlace/2nd catch error===', err)

        const error = new HttpError('Could not find place for this id.', 404);
        return next(error);
    }
    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError('You are not allowed to delete this place.', 401)
        return next(error);
    }


    const imagePath = place.image

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        // await place.remove({ session: sess });
        await place.deleteOne({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        console.log('controller/places-controller/deletePlace/3rd catch error===', err)

        const error = new HttpError(
            'Something went wrong, could not delete place.',
            500
        );
        return next(error);
    }

    fs.unlink(imagePath, err => {
        console.log('controller/places-controller/deletePlace/error image delete===', err)
    })
    res.status(200).json({ message: 'Deleted place.' });
};
// // with Dummy data
// exports.deletePlace = (req, res, next) => {
//     const placeId = req.params.pid
//     if (DUMMY_PLACES.find(p => p.id === placeId)) {
//         throw new HttpError('Could not find a place with requested id', 404)

//     }

//     DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== placeId)

//     res.status(200).json({ message: 'A requested place is deleted' })

// }


exports.getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    // let places;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
        userWithPlacesWithputPopulate = await User.findById(userId)
        // console.log('place-controller/getPlacesByUserId/getPlacesByUserId =====', userWithPlaces)
        // console.log('place-controller/getPlacesByUserId/userWithPlacesWithputPopulate =====', userWithPlacesWithputPopulate)

    } catch (err) {
        console.log('place-controller/getPlacesBy UserId,/ Error inside catch ====', err)
        const error = new HttpError(
            'Fetching places failed, please try again later',
            500
        );
        return next(error);
    }

    // if (!places || places.length === 0) {
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(
            new HttpError('Could not find places for the provided user id.', 404)
        );
    }

    res.json({
        places: userWithPlaces.places.map(place =>
            place.toObject({ getters: true })
        )
    });
};
// // with DUMMY data
// exports.getPlacesByUserId = (req, res, next) => {
//     const userId = req.params.uid
//     const places = DUMMY_PLACES.filter(p => { return p.creator === userId })

//     if (!places || places.length === 0) {
//         // 3rd approach to handling an error
//         return next(new HttpError('Could not find places for the provided id', 404))

//         // // 2nd approach to handling an error
//         // const error = new Error('Could not find a place for the provided id')
//         // error.code = 404
//         // throw error

//         // 1st approach to handling an error
//         // return res.status(404).json({ message: 'Could not find a place for the provided id' })
//     }

//     res.json({
//         message: 'it works',
//         places: places
//     })
// }
