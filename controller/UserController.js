const User = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const multer = require('multer')
const sharp = require('sharp')

const multerStorage = multer.memoryStorage();
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('Not an image !, Please upload only Images',400),false)
    }
}
const upload = multer({
    storage:multerStorage,
    fileFilter : multerFilter
})
exports.uploadUserProfile =upload.single('profile')

exports.resizeUserProfile = async (req,res,next)=>{
  try {
    if(!req.file) return next();
    req.file.filename = `user-${req.body.email}-${Date.now()}.jpeg`;
    req.body.profile = req.file.filename
    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality:90}).toFile(`public/profile/${req.file.filename}`);
    next();
  } catch (error) {
    res.json({error:'error in resizing image'})
    console.log(error.message)
  }
}

exports.editProfile = async (req,res)=>{
  try {
    const data = {
      name:req.body.name,
      mobile:req.body.mobile
    }
    if(req.body.profile){
      data.profile=req.body.profile
    }
    
    
    const updatedData = await User.findOneAndUpdate({email:req.body.email},data)
    res.status(200).json({
      success:'profile updated successfully',
      user:updatedData,
      data : updatedData
    })
  } catch (error) {
    console.log(error.message)
  }
}




exports.checkLogged =  (req,res)=>{
    token= req.cookies.token
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    jwt.verify(token, "afsalSecretKey",async (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Token verification failed" });
      }
      req.userId = decoded.userId; // Make userId available in the request object
      const loggedUser =await User.findById(req.userId)
      res.json({success:'Already logged user',user:loggedUser})
    });  
}




exports.registerUser = async (req, res) => {
  const { name, email,mobile, password } = req.body;
  try {
    const hashed=await bcrypt.hash(password, 10)
    await User.create({
        name,
        email,
        mobile,
        password: hashed,
    })
    .then(user=> res.json({ success: "user registered successfully", user:user }))
    .catch(err=> res.json({error:'user already exists'}))
    
  } catch (error) {
    res.json(error);
  }
};

exports.loginUser = async (req,res)=>{
    const {email,password} = req.body
    try {
       User.findOne({email:email})
       .then(user=> {
         if(user){
            if(!user.isVerified){
              return res.json({error:'you are not verified by admin'})
            }
            bcrypt.compare(password, user.password, (err,decoded)=>{
                if(decoded){
                    const token= jwt.sign({email:user.email,userId:user._id}, 'afsalSecretKey')
                    res.cookie('token', token)
                    res.json({ success: "login successfull", user:user}) 
                }else{
                    return res.json({error:'password is incorrect'})
                }
            })
         }else{
            return res.json({error:'user not exists'})
         }
       })  
    } catch (error) {
        res.json(error);
    }
}


exports.userLogout = (req,res)=>{
  const token = req.cookies.token
  if(token){
    res.clearCookie('token')
    return res.json({success:'user logout successfully'})
  }else{
    return res.json({error:'token not found'})
  }
}



