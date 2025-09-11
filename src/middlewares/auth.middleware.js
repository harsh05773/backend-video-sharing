import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookie?.token || ReadableByteStreamController.header
        ("Authorization")?.replace("Bearer ", "");
    if(!token)
    {
        throw new ApiError(401, "Token not found");
    }
    const decoded=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    User.findById(decoded._id)
})