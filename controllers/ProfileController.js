import { generateRandomNum, imageValidator } from "../utils/helper.js";
import { prisma } from "../db/db.config.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

class ProfileController {
  static async index(req, res) {
    try {
      const userData = req.user;

      //Include imageUrl in the response
      const user = { ...userData };
      const imageURL = cloudinary.url(userData.picture_id);
      user.image = imageURL;
      delete user.picture_id;

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({
        message:
          "Something Went REALLY Bad With The Server :( Please Try Later ?",
      });
    }
  }

  static async store() {}

  static async show() {}

  static async update(req, res) {
    try {
      const { id } = req.params;
      const validUser = req.user;

      // Validating Owner of the Account 
      if (validUser.id !== id) {
        return res.status(401).json({ status: 401, message: "UnAuthorized" });
      }

      // Fetching User
      const user = await prisma.users.findUnique({
        where: {
          id: id,
        },
      });

      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "No Changes Found to Apply" });
      }
      const profile = req.files.profile;
      const message = imageValidator(profile?.size, profile.mimetype);
      if (message != null) {
        return res.status(400).json({
          errors: {
            profile: message,
          },
        });
      }

      // Making image name unique
      const imgEXT = profile?.name.split(".");
      const imageName = generateRandomNum() + "." + imgEXT[1];
      const uploadPath = process.cwd() + "/public/images/profile/" + imageName;
      await profile.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      // upload image on cloudinary
      await new Promise((resolve) => setTimeout(resolve, 50));
      const result = await cloudinary.uploader.upload(uploadPath, {
        folder: "profilePictures",
        resource_type: "image",
      });
      const picture_id = result.public_id;

      // Deleting Old ProfilePic from Server
      if (user.picture_id) {
        await cloudinary.uploader.destroy(user.picture_id);
      }

      fs.unlinkSync(uploadPath);

      // Save the image_id on database
      await prisma.users.update({
        data: {
          picture_id: picture_id,
          updated_at: new Date(),
        },
        where: {
          id: id,
        },
      });

      return res.json({
        status: 200,
        message: "Profile Picture Updated Successful.",
      });
    } catch (error) {
      return res.status(500).json({
        message:
          "Something Went REALLY Bad With The Server :( Please Try Later ?",
        error,
      });
    }
  }

  static async destroy() {}
}

export default ProfileController;
