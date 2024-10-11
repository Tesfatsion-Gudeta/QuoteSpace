const express=require('express')
const router=express.Router()
const{Writing,validate}=require('../models/writing')
const {Comment,validateComment}=require('../models/comment')

const auth=require('../middleware/auth')
const admin=require('../middleware/admin')

//routes

router.get('/',async(req,res)=>{
    res.send(await Writing.find())
})


//while clicking the publish button
router.post('/',auth,async(req,res)=>{
    const {error}=validate(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    let writing= new Writing({
        text:req.body.text
    })

    writing=await writing.save()

    //returning the saved writing for testing puprose
    res.send(writing)
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


                //route handler for comments 

//to get all the comments associated with a specific writing
router.get('/:writingId/comments',async(req,res)=>{
    const writing= await Writing.findById(req.params.writingId).populate('comments')
    if(!writing) return res.status(404).send('writing not found')
    res.send(writing.comments)

})

//for commenting
router.post('/:writingId',auth,async(req,res)=>{

    const {error}=validateComment(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    
    const writing = await Writing.findById(req.params.writingId);
    if (!writing) return res.status(404).send('Writing not found.');
  
    let comment = new Comment({
        content: req.body.content,
        author: req.user._id
        });
      
    comment=await comment.save();
    writing.comments.push(comment._id);
    await writing.save();
      
    res.send(comment);        
})


//deleting a comment: for the author and admin
router.delete('/:writingId/:commentId',[auth,admin],async (req,res)=>{
    const writing=await Writing.findById(req.params.writingId)
    if(!writing) return res.status(404).send('writing not found')
    
    const comment=await Comment.findById(req.params.commentId)
    if(!comment) return res.status(404).send('comment not found')
    
    await Comment.findByIdAndDelete(req.params.commentId);
    writing.comments = writing.comments.filter(id => id.toString() !== req.params.commentId);
    await writing.save();          
    res.send('Comment deleted');
})



                     //route handler for like button
router.post('/:writingId',auth,async(req,res)=>{
    const writing=await Writing.findById(req.params.writingId)
    if(!writing) return res.status(404).send('writing not found')
    
    const userId=req.user._id
    if(writing.likes.includes(userId)) return res.status(400).send('writing already liked')
    
    writing.likes.push(userId)
    await writing.save()

    res.send('writing liked successfully')
})

router.delete('/:writingId',auth,async(req,res)=>{

    const writing=await Writing.findById(req.params.writingId)
    if(!writing) return res.status(404).send('writing not found')
    
    const userId=req.user._id
    
    if(!writing.likes.includes(userId)) return res.status(400).send('writing not liked yet')
    
    writing.likes.pull(req.user._id)
    await writing.save()

    res.send('like removed successfully')
})


module.exports=router