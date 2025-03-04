const HttpError = require('../models/http-error')
const jwt = require('jsonwebtoken')



module.exports = (req, res, next) => {
    // OPTIONS request is blocked, when we use POST in our fetch data as method,
    //  maybe instead of POST method our browser use OPTIONS method,
    //  with below line we use next() to omit whatever error that cause with OPTIONS
    // & continue the rest of codes
    if (req.method === 'OPTIONS') {
        return next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1] // Authoriazation: Bearer Token
        if (!token) {
            throw new Error('Authentication failed')
        }
        // Validating token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        // Adding data to request
        req.userData = { userId: decodedToken.userId }
        next()


    } catch (err) {
        console.log('moddleware/ckeck-auth.js/ inside catch error for token===', err)
        const error = new HttpError('Authentization failed!', 500)
        return next(error)

    }
}
