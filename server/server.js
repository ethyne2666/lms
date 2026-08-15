import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/mongodb.js';


// Initialize Express
const app = express();

// connect to database
await connectDB();

//Middle ware
app.use(cors());

//Routes
app.get('/', (req,res) => res.send("API working"));

//PORT

const PORT = process.env.PORT || 5000 ;

app.listen(PORT , () => console.log(`Server is running on the port ${PORT}`));
