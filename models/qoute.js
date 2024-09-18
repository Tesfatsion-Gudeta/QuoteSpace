const mongoose=require('mongoose')
const Joi=require('joi')

const qouteSchema=new mongoose.Schema({
    text:{
        type:String,
        minLength:20,
        maxLength:1000,
        required:true
    },
    reference:{
        type:String,
        required:true,
        
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment'
    }],
    likes:[{type:mongoose.Schema.ObjectId,ref:'User'}],
    author:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    createdAt:{type:Date,default:Date.now()}
})

const Qoute=mongoose.model('Qoute',qouteSchema)

//input validation

function validateQoute(qoute){
    const schema=Joi.object({
        text:Joi.string().min(20).max(1000).required(),
        reference:Joi.string().min(5).max(200).required()
    })
    return schema.validate(qoute)
}

//export

exports.Qoute=Qoute
exports.validate=validateQoute
