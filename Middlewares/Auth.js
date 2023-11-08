const jwt = require('jsonwebtoken')


exports.islogged =  (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.json({error:'Token is not found'})
    }else{
        jwt.verify(token, 'afsalSecretKey', (err,decoded)=>{
            if(err){ 
              return  res.json({error:'Token is invalid'})
            }else{
                return next()
            }
        })
    }
}

exports.isloggedOut =  (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return next()
    }else{
        jwt.verify(token, 'afsalSecretKey', (err,decoded)=>{
            if(err){
              return  res.json({error:'Token is invalid'})
            }else{
              return res.json({error:'already logged'})
            }
        })
    }
}



exports.isAdminlogged = (req,res,next)=>{
    const token= req.cookies.adminToken;
    if(!token){
        return res.json({error:'token is not found'})
    }else{
        jwt.verify(token, 'afsalSecretKey', (err,decoded)=>{
            if(err) return res.json({error:'Token is invalid'})
            return next()
        })
    }
}







