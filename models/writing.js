const mongoose=require('mongoose')
const Joi=require('joi')
const User=require('./user')

const writingSchema=new mongoose.Schema({
    text:{
        type:String,
        minLength:50,
        maxLength:5000,
        required:true
    },
    comments:[String],
    likes:[{type:mongoose.Schema.ObjectId,ref:'User'}],
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    createdAt:{type:Date,default:Date.now()}
})

const Writing=mongoose.model('writing',writingSchema)

//input validation

function validatewriting(writing){
    const schema=Joi.object({
        text:Joi.string().min(50).max(5000).required()
        })
    return schema.validate(writing)
}

//export

exports.Writing=Writing
exports.validate=validatewriting
