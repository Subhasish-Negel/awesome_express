import { generateRandomNum, imageValidator } from "../utils/helper.js";
import { prisma } from "../db/db.config.js";

class ProfileController {
  static async index(req, res) {
    try {
      const user = req.user;
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
      const uploadPath = process.cwd() + "/public/images/" + imageName;
      profile.mv(uploadPath, (err) => {
        if (err) throw err;
      });

      await prisma.users.update({
        data: {
          profile: imageName,
          updated_at:new Date()
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
      console.log("The Error is", error);
      return res.status(500).json({
        message:
          "Something Went REALLY Bad With The Server :( Please Try Later ?",
      });
    }
  }

  static async destroy() {}
}

export default ProfileController;
