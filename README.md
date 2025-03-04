# Wonderland

A full-stack sample web application based on MERN which is contain Node.js, Express.js, React.js & MongoDb.


## How to run the project on your system
1) Provide all below environmental variables based on your personal data:

##### A) variables related to backend: (add these variiables to .env file)
##### Variables related to connect MongoDb Database
###### - MONGODB_URL
  
##### Variables related to JWT 
###### - JWT_SECRET
###### - JWT_EXPIRE_IN

##### Variables related to use Geocode for converting location's address to coordinates 
###### - GEOCODE_API_KEY

##### B) variables related to frontend: (add these variiables to .env & .env.production files the latter one is for production phase of your program)
##### Variables for getting information from backend 
###### - VITE_BACKEND_URL
###### - VITE_ASSET_URL

##### Variable to show location of place on the map
###### - VITE_MAP_API_KEY
  

Please be noted variables' name are optional, and you can name them whatever you want, but be sure you use same names inside your project too.

2) Use below command in terminal to run project in DEVELOPMENT Environment
###### A) Backend
```bash
npm start
```

###### B) Frontend
```bash
npm run dev
```

3) Use below command in terminal to run project in PRODUCTION Environment
###### A) Backend
```bash
node app.js
```
###### B) Frontend 
```bash
npm run build
serve
```


## Deployment
You can find a **live** example of website in below link:

[click to check out ](https://wonder-land.netlify.app/) 
