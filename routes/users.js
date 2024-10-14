const express=require('express')
const mongoose=require('mongoose')
const {validate,User}=require('../models/user')
const _=require('lodash')
const bcrypt=require('bcrypt')
const router=express.Router()
const auth=require('../middleware/auth')
const { config } = require('dotenv')

//routes

router.get('/me',auth,async(req,res)=>{
   const user= await User.findById(req.user._id).select('-password')
   res.send(user)

})


//signin
router.post('/signin',async(req,res)=>{
   const {error}=validate(req.body)
   if(error) return res.status(400).send(error.details[0].message)
   
   let user=await User.findOne({email:req.body.email})
    if(user) return res.status(400).send('user already registered')
    
    user=new User(_.pick(req.body,['name','email','password']))
    const salt=await bcrypt.genSalt(10)
    user.password=await bcrypt.hash(user.password,salt)
    
    await user.save()

   const token= user.generateAuthToken()
   res.header('x-auth-token',token).send( _.pick(user,['_id','name','email']))
}) 


//login
router.post('/login',async(req,res)=>{

   const {email,password}=req.body

   if(!email||!password) return res.status(400).send('email and password required')
   
   const user=await User.findOne({email})
   if(!user) return res.status(400).send('Invalid email or password')
   
   const validPassword=await bcrypt.compare(password,User.password)
   if(!validPassword) return res.status(400).send('Invalid email or password')
   
   const accessToken=user.generateAuthToken()
   const refreshToken=user.generateRefreshToken()

   //refreshtoken
   res.cookie('refreshToken',refreshToken,{
      httpOnly:true,
      secure:true,
      sameSite:'strict',
      maxAge:7 * 24 * 60 * 60 * 1000
   })

   res.header('x-auth-token',accessToken).send('user logged in successfully')
   

})



//route for refreshing the token

router.post('/refresh-token',async(req,res)=>{

   const refreshToken=res.cookie.refreshToken
   if(!refreshToken) return res.status(401).send('refresh token required!.')
   
   try{
        const decoded=jwt.verify(refreshToken,config.get('jwtRefreshKey'))
         const user=await User.findById(decoded._id)
         if (!user) return res.status(400).send('Invalid refresh token.')
         const newAccessToken=user.generateAuthToken()
         res.header('x-auth-token', newAccessToken).send('Token refreshed successfully.');
   }catch(error){
      res.status(403).send('Invalid or expired refresh token.');
    }

})

//for loggingout

router.post('/api/logout', (req, res) => {
   res.clearCookie('refreshToken'); // Clear the refresh token cookie
   res.send('Logged out successfully.');
});


//export
module.exports=router 

