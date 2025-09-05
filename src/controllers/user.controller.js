import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiRespose.js";

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

export { registerUser }