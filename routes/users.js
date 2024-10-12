const express=require('express')
const mongoose=require('mongoose')
const {validate,User}=require('../models/user')
const _=require('lodash')
const bcrypt=require('bcrypt')
const router=express.Router()
const auth=require('../middleware/auth')

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

   if(!email||!password) return res.status(400).send("email and password required")
   
   const user=User.findOne({email})
   if(!user) return res.status(400).send('Invalid email or password')
   
   const validPassword = await bcrypt.compare(password, user.password);
   if (!validPassword) return res.status(400).send('Invalid email or password.')
   
   const token = user.generateAuthToken()
   res.header('x-auth-token', token).send('Logged in successfully.')

})


//export
module.exports=router 

