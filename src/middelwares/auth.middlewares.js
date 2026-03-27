import { User } from "../models/user.models";
import { Apierror } from "../utils/Apierror";
import asyncHandler from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
export const VerifyJWT = asyncHandler(async(req, _,next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        
        if(!token){
            throw new Apierror(401, "Unauthorized Access - No Token Provided");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken,_id).select
        ("-password -refreshToken")
        if (!user) {
            throw new Apierror(401, "Invald Access Token")        
        }
        req.user = user;
        next();
    } catch (error) {
        throw new Apierror(401, "Invalid Access Token");
    }
})