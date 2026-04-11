import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

const registerUser = asyncHandler(async (req, res) => {
  // get user datails
  // validation- not empty
  // check if user already exists email, username
  // check for image ,avatar
  // upload image to cloudinary
  // create user object and save to database
  // remove password and refresh token from response
  // check for user creation
  // return response

  const { fullname, username, email, password } = req.body;
  // console.log("req.files :", req.files);

  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverimagelocalPath = req.files?.coverImage[0]?.path;

  let coverimagelocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverimagelocalPath = req.files.coverImage[0].path;
  }

  const existedUser = await User.findOne({
    $or: [{ email: email }, { username: username }],
  });

  if (existedUser) {
    if (avatarLocalPath) {
      fs.unlink(`${avatarLocalPath}`, (err) => {
        if (err) throw err;
        console.log("file1 deleted");
      });
    }

    if (coverimagelocalPath) {
      fs.unlink(`${coverimagelocalPath}`, (err) => {
        if (err) throw err;
        console.log("file2 deleted");
      });
    }
    // if (req.files?.avatar[0]?.path) {
    //   fs.unlink(`${req.files?.avatar[0]?.path}`, (err) => {
    //     if (err) throw err;
    //     console.log("file1 deleted");
    //   });
    // }
    // if (req.files?.coverImage[0]?.path) {
    //   fs.unlink(`${req.files?.coverImage[0]?.path}`, (err) => {
    //     if (err) throw err;
    //     console.log("file2 deleted");
    //   });
    // }
    throw new ApiError(409, "User with email or username already exists");
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file in required");
  }

  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverimagelocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file in required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
