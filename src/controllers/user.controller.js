import asyncHandler from '../utils/asyncHandler.js';
import {Apierror} from "../utils/Apierror.js";
import {User} from "../models/user.models.js";
import {UploadToCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";

const genrateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false});
        return {accessToken, refreshToken};

    } catch (error) {
        throw new Apierror(500, "Error in genrating Access and Refresh Token");
    }
}
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
const registerUser  = asyncHandler(async(req,res) => {

    const {fullName, email, password, username} = req.body;
    console.log("email:", email);
    console.log(req.body);

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === "")) 
        {
        throw new Apierror(400, "All fields are required");
        }

    const existingUser = await User.findOne({
        $or: [{ email }, { username }],
    });
    if (existingUser) {
        throw new Apierror(400, "User with this email or username already exists");
    }
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if(!avatarLocalPath) {
        throw new Apierror(400, "Avatar file is required");
    }

    const avatar = await UploadToCloudinary(avatarLocalPath);
    let coverImageData;

    if (coverImageLocalPath) {
        coverImageData = await UploadToCloudinary(coverImageLocalPath);
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImageData?.url,
        email,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new Apierror(500, "Something went Wrong While Registering the User!!!!");
    }

    return res.status(200).json(
        new ApiResponse(201, "User Registered Successfully", createdUser));
});

const loginUser = asyncHandler(async(req,res) => {
    /**
     Steps For Login User : 
     1. req.body se data le aao
     2. Check for username and email
     3. Find the User
     4. password check
     5. Genrate Access token and Refresh token
     6. Then to send these tokens to user in terms of Cookies.
     */

     const { username, email, password} = req.body;
    //  console.log(req.body);
     if(!email && !username){
        throw new Apierror(400, "Email and Password are required");
     }
     const user = await User.findOne({
        $or : [{email}, {username}]
     })
     //console.log(username, email);
     if(!user){
        throw new Apierror(404, "User not found with this email or username");
     }
     const isPasswordValid = await user.isPasswordCorrect(password);
     if(!isPasswordValid){
        throw new Apierror(401, "Invalid User Credentials");
     }

     const{accessToken,refreshToken} = await genrateAccessAndRefreshToken(user._id);
// Important : we should not send password and refresh token in response
// we can send access token in response but refresh token should be sent in http only cookie
     const loggedInUser = await User.findById(user._id).select
     ("-password -refreshToken");

     const cookieOptions = {
        httpOnly : true,
        secure : true,
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken, cookieOptions)
     .cookie("refreshToken", refreshToken, cookieOptions)
     .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,
                accessToken,refreshToken
            },
            "User Logged In Successfully"
        )
     )
});

const logoutUser = asyncHandler(async(req,res) => {
    // Steps for Logout User :
    // 1. Get the user from req.user
    // 2. Remove the refresh token from database
    // 3. Clear the cookies from frontend
    await User.findByIdAndUpdate(req.user._id, 
    {
        $set :{
            refreshToken : undefined,
        }
    }, 
    {new : true});
    const cookieOptions = {
        httpOnly : true,
        secure : false,
     }
     return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(
            new ApiResponse(200, "User Logged Out Successfully")
        )
});

const refreshAccessToken = asyncHandler(async(req,res) => {
    // Steps for Refresh Access Token :
    // 1. Get the refresh token from cookies
    // 2. Verify the refresh token
    // 3. If valid, genrate new access token and refresh token
    // 4. Update the refresh token in database
    // 5. Send the new access token and refresh token in cookies

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new Apierror(400, "Unauthorized Request - No Refresh Token");
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id);
        if (!user) {
            throw new Apierror(401, "Invalid Refresh Token");
        }
        if(user.refreshToken !== incomingRefreshToken){
            throw new Apierror(401, "Refresh Token Mismatch - Possible Token Theft");
        }
        const cookieOptions = {
            httpOnly : true,
            secure : true,
         }  
         const { accessToken, newRefreshToken } = await genrateAccessAndRefreshToken(user._id);
    
         return res
         .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    {accessToken, newRefreshToken},
                    "Access Token Refreshed Successfully"
                )
            )
    } catch (error) {
        console.log("Refresh Token Error 👉", error.message);
        throw new Apierror(401, "Invalid Refresh Token");
    }
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};
  
    
  