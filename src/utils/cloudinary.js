import {v2 as cloudinary} from "cloudinary";

import fs from "fs";

// This utility handles file uploads to Cloudinary in a two-step process:
// 1. Configure Cloudinary with API credentials from environment variables.
// 2. Upload the local file to Cloudinary and handle success/error cases.

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
});

// Function to upload a file to Cloudinary
const UploadToCloudinary = async(localfilepath) =>{
    try {
        // Check if local file path is provided
        if(!localfilepath) return null;
        // Step 1: Upload the file to Cloudinary
        const response  = await cloudinary.uploader.upload(localfilepath, {
            resource_type : "auto",
        });
        // console.log("File has been Uploaded Cloudinary", response.url);
        fs.unlinkSync(localfilepath); // Step 3: Delete the local file after successful upload
        return response;
    } catch (error) {
        // Step 2: If upload fails, delete the local file to clean up
        fs.unlinkSync(localfilepath);
        console.log("Error in uploading file to cloudinary", error);
        return null;
    }
}

export {UploadToCloudinary};