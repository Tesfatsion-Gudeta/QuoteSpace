const mongoose=require('mongoose')
const Joi=require('joi')

const writingSchema=new mongoose.Schema({
    text:{
        type:String,
        minLength:3,
        maxLength:5000,
        required:true
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }],
    likes:[{type:mongoose.Schema.ObjectId,ref:'User'}],
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    createdAt:{type:Date,default:Date.now()}
})

const Writing=mongoose.model('Writing',writingSchema)

//input validation

function validatewriting(writing){
    const schema=Joi.object({
        text:Joi.string().min(3).max(5000).required()
        })
    return schema.validate(writing)
}

//export

exports.Writing=Writing
exports.validate=validatewriting
