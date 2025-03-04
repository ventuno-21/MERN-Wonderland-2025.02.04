const dotenv = require('dotenv')
dotenv.config({ path: './.env' })
const express = require("express")
const bodyParser = require("body-parser")
const placesRoutes = require('./routes/places-routes')
const usersRoutes = require('./routes/user-routes')
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const HttpError = require('./models/http-error')
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs')
const path = require('path')



const app = express()
// const swaggerDocument = require('./swagger.json');

// This will extract any json data from body

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

// // Pereventing CORS problems
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     // Among below headers only authorization header will be set by ourself
//     res.setHeader(
//         'Access-Control-Allow-Headers',
//         'Origin, X-Requested-With, Content-Type, Accept, Authorization'
//     );
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');

//     next();
// });


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})


app.use(cors());
app.options('*', cors());

// api routes
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)
app.post('/test', (req, res, next) => { res.send('<h1> User = ' + req.body.username + '</h1>') })

app.get('/test', (req, res, next) => {
    res.send(
        '<form method="POST"><input type="text" name="username"> <button type="submit"> submit</button></form>'
    )
})

app.use((req, res, next) => {
    const error = new HttpError('Could not find the route ', 404)
    throw error
})


// This Error Middleware should be written after ROUTES
app.use((error, req, res, next) => {
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log('app.js/app.use() callback error for deleting a file=== ', err)
        })
    }
    if (res.headerSent) {
        return next(error)
    }
    res.status(error.code || 500)
        .json({ message: error.message || "An unkown error occurred" })
})



// swagger details based on package swaggerJsdoc
const options = {
    failOnErrors: true, // Whether or not to throw when parsing errors. Defaults to false.
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Visitinng wonderful places',
            version: '1.0.0',
        },
        // servers: [
        //     { api: 'http://127.0.0.1:5000/' }
        // ]
    },
    apis: ['./routes*.js'],
};

const openapiSpecification = swaggerJsdoc(options);
router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(openapiSpecification));
// router.get('/api-docs', swaggerUi.setup(swaggerDocument));


// Connecting to MongoDb databse
const port = 5000

mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
        app.listen(process.env.PORT || port);
        console.log(`App is running on port no. ${port}...`)
        console.log(`MongoDb is connected!`)
    })
    .catch(err => {
        console.log(err);
    });


