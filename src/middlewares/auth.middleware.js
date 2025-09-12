import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookie?.token || ReadableByteStreamController.header
            ("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Token not found");
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = User.findById(decoded?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        req.user = user;
        next();
    }
    catch(error)
    {
        throw new ApiError(401, error?.message||"Go to authmiddleware to handle error")
    }
})

export default verifyJWT;