import mongoose from "mongoose";

// Connect to the mongoDB database

const connectDB = async () => {
    // register an event
    mongoose.connection.on('connected' , () => console.log('Database Connected'));

    //connect with data base
    await mongoose.connect(`${process.env.MONGODB_URI}/lms`);
}

export default connectDB ;