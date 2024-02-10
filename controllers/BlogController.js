import {
  generateRandomNum,
  imageValidator,
  checkIdFormat,
} from "../utils/helper.js";
import { prisma } from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { blogSchema } from "../validations/BlogValidation.js";
import { blogUpdateSchema } from "../validations/BlogUpdateValidation.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";

export class BlogController {
  static async index(req, res) {
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 2;

    if (page <= 0) {
      page = 1;
    }

    if (limit <= 0 || limit > 5) {
      limit = 5;
    }

    const skip = (page - 1) * limit;
    const totalBlogs = await prisma.blogs.count();
    const totalPages = Math.ceil(totalBlogs / limit);

    const blogs = await prisma.blogs.findMany({
      skip: skip,
      take: limit,
      select: {
        id: true,
        title: true,
        content: true,
        image_id: true,
        created_at: true,
        user: {
          select: {
            id: true,
            name: true,
            picture_id: true,
          },
        },
      },
    });

    // Process each object
    for (const item of blogs) {
      item.image = cloudinary.url(item.image_id);
      delete item.image_id;
    }

    return res.json({
      status: 200,
      blogs: blogs,
      metadata: {
        totalPages,
        currentPage: page,
        currentLimit: limit,
      },
    });
  }

  static async create(req, res) {
    try {
      const user = req.user;
      const body = req.body;
      const validator = vine.compile(blogSchema);
      const payload = await validator.validate(body);

      if (!req.files || Object.keys(req.files).length === 0) {
        return res
          .status(400)
          .json({ status: 400, message: "Image filed is required" });
      }

      // Custom image validator
      const image = req.files?.image;
      if (!image) {
        return res
          .status(411)
          .json({ error: "Please Provide Blog Cover Image" });
      }
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
      await new Promise((resolve) => setTimeout(resolve, 50));
      const result = await cloudinary.uploader.upload(uploadPath, {
        folder: "blogPictures",
        resource_type: "image",
      });
      const image_id = result?.public_id;
      fs.unlinkSync(uploadPath);

      // Save the image_id on database
      payload.image_id = image_id;
      await prisma.blogs.create({
        data: payload,
      });

      //Include imageUrl in the response
      const response = { ...payload };
      const imageURL = cloudinary.url(image_id);
      response.image = imageURL;
      delete response.image_id;
      return res.json({
        status: 200,
        message: "Blog Created Successfully",
        response,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        return res.status(500).json({
          status: 500,
          message: error.message,
          announce:
            "Something Went REALLY Bad With The Server :( Please Try Later ?",
        });
      }
    }
  }

  static async show(req, res) {
    try {
      const { id } = req.params;

      // Check if ID is valid
      if (!checkIdFormat.test(id)) {
        return res.status(400).json({ error: "Invalid ObjectID" });
      }

      const blog = await prisma.blogs.findUnique({
        where: {
          id: id,
        },
        select: {
          id: true,
          title: true,
          content: true,
          image_id: true,
          created_at: true,
          user: {
            select: {
              id: true,
              name: true,
              picture_id: true,
            },
          },
        },
      });

      // Not Found Error Handling
      if (!blog) {
        return res.status(404).json({ error: "Blog Not Found" });
      }
      res.json({ status: 200, blog: blog });
    } catch (error) {
      return res.status(500).json({
        message:
          "Something Went REALLY Bad With The Server :( Please Try Later ?",
        error: error,
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const body = req.body;

      // Check if ID is valid
      if (!checkIdFormat.test(id)) {
        return res.status(400).json({ error: "Invalid ObjectID" });
      }

      // Get the Blog
      const blog = await prisma.blogs.findUnique({
        where: { id: id },
      });

      // No Blog Found Error Handling
      if (!blog) {
        return res.status(404).json({ error: "Blog Not Found" });
      }

      // Check the Owner
      if (user.id !== blog.user_id) {
        return res.status(401).json({ message: "UnAuthorized" });
      }

      // Data Validation
      const validator = vine.compile(blogUpdateSchema);
      const payload = await validator.validate(body);

      // Check Image Exists
      const image = req.files?.image;
      if (image) {
        const message = imageValidator(image?.size, image?.mimetype);
        if (message !== null)
          return res.status(400).json({ errors: { image: message } });

        const imgEXT = image.name.split(".");
        const newImageName = generateRandomNum() + "." + imgEXT[1];
        const uploadPath =
          process.cwd() + "/public/images/blog/" + newImageName;
        await image.mv(uploadPath, (err) => {
          if (err) throw err;
        });

        // Upload image on cloudinary
        await new Promise((resolve) => setTimeout(resolve, 50));
        const result = await cloudinary.uploader.upload(uploadPath, {
          folder: "blogPictures",
          resource_type: "image",
        });
        const image_id = result?.public_id;
        payload.image_id = image_id;
        fs.unlinkSync(uploadPath);

        // Deleting Old CoverPic from Server
        if (blog.image_id) {
          await cloudinary.uploader.destroy(blog.image_id);
        }
      }

      //If No Update
      if (Object.keys(payload).length === 0) {
        return res.status(411).json({ error: "No Changes Found to Update" });
      }

      // Save the image_id on database
      await prisma.blogs.update({
        data: { ...payload, updated_at: new Date() },
        where: {
          id: id,
        },
      });

      res.status(200).json({
        message: "Blog Updated Successfully",
        data: payload,
      });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return res.status(400).json({ errors: error.messages });
      } else {
        res.status(400).json({ error: error });
      }
    }
  }

  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Check if ID is valid
      if (!checkIdFormat.test(id)) {
        return res.status(400).json({ error: "Invalid ObjectID" });
      }

      const blog = await prisma.blogs.findUnique({
        where: {
          id: id,
        },
      });

      // No Blog Found Error Handling
      if (!blog) {
        return res.status(404).json({ error: "Blog Not Found" });
      }

      if (user.id !== blog.user_id) {
        return res.status(401).json({ message: "UnAuthorized" });
      }

      // CAUTION !! This is for deleting Media from Cloudinary, Remove this code after implementing Soft Delete !!!!
      if (blog.image_id) {
        await cloudinary.uploader.destroy(blog.image_id);
      }
      // Delete Blog
      await prisma.blogs.delete({
        where: {
          id: id,
        },
      });
      res.status(200).json({
        message: "Blog Deleted Successfully",
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message:
          "Something Went REALLY Bad With The Server :( Please Try Later ?",
        error: error,
      });
    }
  }
}
