const mongoose = require('mongoose');
const dotenv = require("dotenv");

dotenv.config(); 

const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.opxwe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.connect(uri);

mongoose.connection.on('connected', () => {
  console.log("Connected to MongoDB!");
});