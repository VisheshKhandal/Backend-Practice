import asyncHandler from '../utils/asyncHandler.js';
import {ApiError} from "../utils/Apierror.js";
import {User} from "../models/user.model.js";
import {UploadToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
const registerUser  = asyncHandler(async(req,res) => {

    const {fullname, email, password, username} = req.body;
    console.log("email:", email);
    console.log(req.body);

    if (
        [fullname, email, username, password].some(
            (field) => field?.trim() === "")) 
        {
        throw new ApiError(400, "All fields are required");
        }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });
    if (existingUser) {
        throw new ApiError(400, "User with this email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }
    

    const avatar = await UploadToCloudinary(avatarLocalPath);
    const coverImage = await UploadToCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required");
    }
    const user = await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500, "Something went Wrong While Registering the User!!!!");
    }

    return res.status(200).json(
        new ApiResponse(201, "User Registered Successfully", createdUser));
});

export {registerUser};
  /**
     *  Steps for Registration algo : 

     * 1. Get users Detailed from Frontend
     * 2. Validation - not empty
     * 3. check if user is already exist : username or email.
     * 4. check for images and check for avtar
     * 5. Upload them to cloudinary : avtar
     * 6. Create User object, create entry in database
     * 7. remove password and refresh token field from response
     * 8. check for user connection
     * 9. return result.
     **/