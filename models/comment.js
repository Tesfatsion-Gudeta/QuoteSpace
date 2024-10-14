const mongoose=require('mongoose')
const Joi=require('joi')

const commentSchema=new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
    ,
    commentedAt:{
        type:Date,
        deafult:Date.now
    }
})

const Comment=mongoose.model('Comment',commentSchema)


//validation

async function validateComment(comment){
    const schema=Joi.object({content:Joi.string().min(3).max(300)})
    return await schema.validate(comment)

}

module.exports.commentSchema=commentSchema
module.exports.Comment=Comment
module.exports.validateComment=validateComment
