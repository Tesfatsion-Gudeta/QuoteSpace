const express=require('express')
const mongoose=require('mongoose')
require('dotenv').config()
const app=express()
const writings=require('./routes/writings')
const qoutes=require('./routes/qoutes.js')



app.use('/api/writings',writings)
app.use('/api/qoutes',qoutes)


mongoose.connect(process.env.MONGODB_URI)
  .then(()=>{
    console.log('mongodb connected succesfully.')
  })
  .catch(err=>{console.error('mongodb connection error: ',err)})

  // Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

