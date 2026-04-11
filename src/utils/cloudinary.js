import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localfilePath, {
      resource_type: "auto",
      folder: "youtube-backend-content",
    });
    // file has been uploaded successfully
    // console.log("file is uploaded on cloudinary", response.url);
    fs.unlinkSync(localfilePath);
    // console.log("response --- ",response);

    return response;
  } catch (error) {
    fs.unlinkSync(localfilePath); //remove the the locally save temporary file as the upload operation got failed
    return null;
  }
};

export { uploadToCloudinary };
