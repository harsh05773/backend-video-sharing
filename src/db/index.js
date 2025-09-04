import mongoose from "mongoose";
import { dbName } from "../constants.js";

const connectDB = async () => {
    try {
        const connectionInstance=await mongoose.connect(`${process.env.MONGO_URI}/${dbName}`);
        console.log(`\n db connected: DB Host:${connectionInstance.connection.host}`);
    } catch (err) {
        console.error("❌ DB connection error:", err);
        process.exit(1);
    }
}

export default connectDB;