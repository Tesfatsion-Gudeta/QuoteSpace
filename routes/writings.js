const express=require('express')
const router=express.Router()
const{Writing,validate}=require('../models/writing')
const auth=require('../middleware/auth')
const admin=require('../middleware/admin')

//routes

router.get('/',async(req,res)=>{
    res.send(await Writing.find())
})
router.post('/',auth,async(req,res)=>{
    const {error}=validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    const writing= new Writing({
        text:req.body.text
    })
    res.send(await writing.save())
})
router.put('/:id',auth,async(req,res)=>{
    const {error}=validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    
        //updating on the database
    const writing= await Writing.findByIdAndUpdate(req.params.id,{text:req.body.text},{new:true})
    if(!writing) return res.status(404).send('Writing with that specific id is not found')
    res.send(writing)

})
router.delete('/:id',[auth,admin],async (req,res)=>{
    const writing= await Writing.findByIdAndDelete(req.params.id)
    if(!writing) return res.status(404).send('Writing with that specific id is not found')
    res.send(writing)
})


//for getting a single writing
router.get('/:id',async(req,res)=>{
    const writing= await Writing.findById(req.params.id)
    if(!writing)return res.status(404).send("couldn't find writing with that specific id")
    res.send(writing)

})

module.exports=router