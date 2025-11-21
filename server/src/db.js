const mongoose = require("mongoose")

const ConnectDb =async (url) =>{
    console.log(url)
    await mongoose.connect(url)
    .then(()=>{
        console.log("Connect to MongoDB")
    })
    .catch((err)=>{
        console.log("Error Connecting to MongoDB",err)
    })
}

module.exports = {ConnectDb}