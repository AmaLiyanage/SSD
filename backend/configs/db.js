import mongoose from "mongoose";

const connectDB = async ()=>{
    try{
            mongoose.connection.on('connected', ()=> console.log("Database Connected"));
            const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
            if (!uri) {
                throw new Error("MongoDB connection string (MONGO_URI) is missing in environment variables.");
            }
            const dbName = process.env.NODE_ENV === 'test' ? 'water-well-test' : 'water-well';
            
            await mongoose.connect(uri, {
                dbName: dbName
            });


    } catch (error) {
        console.log(error.message);
    }
}
export default connectDB;