const express = require('express')
const { ConnectDb } = require('./db')

const app = express()
const PORT = 8000

ConnectDb("mongodb://127.0.0.1:27017/buddyScript")

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})