import { User } from "../models/user.models.js";
import { Apierror } from "../utils/Apierror.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const VerifyJWT = asyncHandler(async(req, _,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        // console.log(token);
        if(!token){
            throw new Apierror(401, "Unauthorized Access - No Token Provided");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // console.log(process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken.id).select
        ("-password -refreshToken")
        if (!user) {
            // console.log("JWT ERROR:", error.message); // 🔥 important
            throw new Apierror(401, "Invald Access Token")        
        }
        req.user = user;
        next();
    } catch (error) {
         console.log("JWT ERROR 👉", error.message);
        throw new Apierror(401, "Invalid Access Token");
    }
    
})