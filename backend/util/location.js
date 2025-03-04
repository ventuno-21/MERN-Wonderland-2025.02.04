const axios = require('axios');
const HttpError = require('../models/http-error');



const API_KEY = process.env.GEOCODE_API_KEY


// 3rd approach => https://geocode.maps.co/account/?notice=account_verified
// example: https://geocode.maps.co/search?q=address&api_key=67b6c85ad2188734336092fkpadb666
async function getCoordsForAddress(address) {
    // return {
    //   lat: 40.7484474,
    //   lng: -73.9871516
    // };
    // console.log('address===', `https://geocode.maps.co/search?q=${encodeURIComponent(address)}&api_key=${API_KEY}`)
    // console.log('address===', `https://geocode.maps.co/search?q=${address}&api_key=${API_KEY}`)

    const response = await axios.get(
        `https://geocode.maps.co/search?q=a${address}&api_key=${API_KEY}`
    );

    const data = response.data;

    if (!data || data.length === 0) {
        const error = new HttpError('Could not find location for the specified address.', 422);
        throw error;
    }
    console.log('util/location/getCoordsForAddress/response.data ===', response.data)
    // console.log('util/location/getCoordsForAddress/response.data lat ===', response.data[0].lat)
    // console.log('util/location/getCoordsForAddress/response.data long ===', response.data[0].lon)

    const coordinates = { lat: response.data[0].lat, lng: response.data[0].lon }
    console.log('util/location/getCoordsForAddress/coordinates====', coordinates)

    return coordinates;
}

// // 1st Approach => return Dummy data (if we arent able to provide API_KEY )
// async function getCoordsForAddress(address) {
// return {
//   lat: 40.7484474,
//   lng: -73.9871516
// };

// // 2nd Approach => Google maps
// async function getCoordsForAddress(address) {
//     // return {
//     //   lat: 40.7484474,
//     //   lng: -73.9871516
//     // };
//     const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//             address
//         )}&key=${API_KEY}`
//     );

//     const data = response.data;

//     if (!data || data.status === 'ZERO_RESULTS') {
//         const error = new HttpError(
//             'Could not find location for the specified address.',
//             422
//         );
//         throw error;
//     }

//     const coordinates = data.results[0].geometry.location;

//     return coordinates;
// }

module.exports = getCoordsForAddress;
