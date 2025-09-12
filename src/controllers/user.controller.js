import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiRespose.js";
import jwt from "jsonwebtoken";

const generateAccessRefreshTokens = async (userId) => {
    try {
        const user = await findById(userId)
        const token = await user.generateAccessTokens()
        const refrehToken = await user.refreshAccessTokens()
        user.refrehToken = refrehToken;
        await user.save({ validateBeforeSave: false });
        return { token, refrehToken };
    } catch (error) {
        console.error("Token couldn't be generated");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Steps:-
    // Get the user details
    // Validate the user details check if fields are not empty
    const { email, fullName, username, password } = req.body;
    console.log(fullName);
    if ([email, fullName, username, password].some(field => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    // Check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with the email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverimageLocalPath = req.files?.coverimage?.[0]?.path;
    // Check for avatar/images

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar required")
    }
    // Upload images to cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverimage = await uploadOnCloudinary(coverimageLocalPath);

    if (!avatar) {
        throw new ApiError(400, "Avatar required")
    }

    // Create user object: create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // Check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Error in registering the user");
    }

    // return response
    console.log("User registered successfully");
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!email && !username) {
        throw new ApiError(400, "Required username or password");
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "Uper not registered");
    }
    const passwordValid = await isPasswordCorrect(password);
    if (!password) {
        throw new ApiError(401, "Password is Wrong");
    }
    const { token, refreshToken } = await generateAccessTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("token", token, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, token, refreshToken
            },
                "User logged in Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        },
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("token", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "USER LOGGED OUT"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid Refresh token");
        }
        if (incomingRefreshToken !== user.refrehToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { token, newRefreshToken } = await generateAccessRefreshTokens(user._id);
        return res
            .status(200)
            .cookie("token", token, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { token, refreshToken: newRefreshToken },
                    "Access Token successfully refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, 
            error.message
        )
    }

})
export { registerUser, loginUser, logoutUser, refreshAccessToken }