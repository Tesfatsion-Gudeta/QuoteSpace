const mongoose=require('mongoose')
const Joi=require('joi')

const writingSchema=new mongoose.Schema({
    text:{
        type:String,
        minLength:50,
        maxLength:5000,
        required:true
    }
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
