const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
const path = require('path')
const userController = require('./controller/UserController')
const adminController = require('./controller/AdminController')
const {islogged,isloggedOut,isAdminlogged,isAdminloggedOut} = require('./Middlewares/Auth')

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin:['http://localhost:3000'],
    methods:['POST','GET'],
    credentials:true
}))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname, 'public')))

mongoose
  .connect("mongodb://127.0.0.1:27017/USM-MERN")
  .then(() => console.log("db connected"))
  .catch((error) => console.log(error));

//user routes  
app.post('/register',isloggedOut,userController.registerUser)
app.post('/login',isloggedOut, userController.loginUser)
app.get('/userLogout',islogged,userController.userLogout)
app.post('/editProfile',islogged,userController.uploadUserProfile,userController.resizeUserProfile, userController.editProfile)

    
//session managment routes
app.get('/checkLogged',islogged, userController.checkLogged)
app.get('/checkAdminLogged',isAdminlogged,adminController.checkAdminLogged)   
   
//admin routes
app.post('/Adminlogin',adminController.loginAdmin)
app.get('/logoutAdmin',isAdminlogged, adminController.logoutAdmin)
app.post('/UpdateUser',isAdminlogged, adminController.updateUser)
app.post('/deleteUser',isAdminlogged, adminController.deleteUser)
app.get('/getUsers',isAdminlogged,adminController.getUsers)

 
app.listen(5000, () => {
  console.log("server started on port 5000");
});
