const mongoose = require('mongoose');

const connectDB = () => {
    try{
        const conn = mongoose.connect(process.env.MONGO_URL)
        console.log("database connected")
    }
    catch (error){
        console.log("database connection error")
    }
}
module.exports = connectDB