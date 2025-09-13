import mongoose, { Schema } from "mongoose";

const subscriptonSchema= new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.type.ObjectID,
        ref:"User"
    },
    channel:{
        type:mongoose.Schema.type.ObjectID,
        ref
    }
},{timestamps:true})

export const Subscription=mongoose.model("Subscription", subscriptonSchema);