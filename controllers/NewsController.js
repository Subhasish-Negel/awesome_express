import { generateRandomNum, imageValidator } from "../utils/helper.js";
import { prisma } from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { newsSchema } from "../validations/NewsValidation.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export class NewsController {
  static async index(req, res) {
    const news = await prisma.news.findMany();
    return res.json({ status: 200, news: news });
  }

  static async store(req, res, next) {
    try {
      const user = req.user;
      const body = req.body;
      const validator = vine.compile(newsSchema);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Image filed is required" });
      }

      // Custom image validator

      const image = req.files?.thumbnail;
      const message = imageValidator(image?.size, image?.mimetype);
      if (message !== null)
        return res.status(400).json({ errors: { image: message } });

      // Unqiue image name
      const imgEXT = image?.name.split(".");
      const newImageName = generateRandomNum() + "." + imgEXT[1];
      const uploadPath = process.cwd() + "/public/images/blog/" + newImageName;
      await image.mv(uploadPath, (err) => {
        if (err) throw err;
      });
      payload.user_id = user.id;

      // upload image URL on cloudinary
      await new Promise((resolve) => setTimeout(resolve, 100));
      const result = await cloudinary.uploader.upload(uploadPath);
      payload.image = result.secure_url;
      fs.unlinkSync(uploadPath); //Removing the file after successful upload

      // save the image on database
      const blog = await prisma.news.create({
        data: payload,
      });

      return res.json({
        status: 200,
        message: "Blog Created Successfully",
        blog,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        console.log(error.message);
        return res.status(500).json({
          status: 500,
          message: error.message,
          announce:
            "Something Went REALLY Bad With The Server :( Please Try Later ?",
        });
      }
    }
  }

  static async show(req, res, next) {}

  static async update(req, res, next) {}

  static async destroy(req, res, next) {}
}
