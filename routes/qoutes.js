const express=require('express')
const router=express.Router()
const{Qoute,validate}=require('../models/qoute')
const auth=require('../middleware/auth')
const admin=require('../middleware/admin')
const { User } = require('../models/user')


//routes
router.get('/',async(req,res)=>{
try {
        const qoutes=await Qoute.find()
        .populate({path:'author',select:'name'})
        .select('text reference likes author createdAt')
    
        const processedQoutes=qoutes.map(qoute=>({
            text: quote.text,
             reference: quote.reference,
            likesCount: quote.likes.length,  
            author: quote.author ? quote.author.name : 'Unknown',  
            createdAt: quote.createdAt
        }))
        res.send(processedQoutes)
} catch (error) {
    res.status(500).send({message:'error retrieving qoutes.', error:error.message})
    
}

})
router.post('/',auth,async(req,res)=>{
    const {error}=validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const qoute= new Qoute({
        text:req.body.text,
        reference:req.body.reference
    })

    //for testing if the qoute is successfully saved on the database
    res.send(await qoute.save())
})
router.put('/:id',auth,async(req,res)=>{
    const {error}=validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    
        //updating on the database
    const qoute= await Qoute.findByIdAndUpdate(req.params.id,{text:req.body.text},{new:true})
    if(!qoute) return res.status(404).send('qoute with that specific id is not found')
   
    //returns the edited qoute
    //for tesing purpose
     res.send(qoute)

})
router.delete('/:id',[auth,admin],async (req,res)=>{
    const qoute= await Qoute.findByIdAndDelete(req.params.id)
    if(!qoute) return res.status(404).send('qoute with that specific id is not found')
    res.send(qoute)
})