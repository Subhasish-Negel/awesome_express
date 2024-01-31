import { imageValidator } from "../utils/helper.js";
import { prisma } from "../db/db.config.js";
import vine from "@vinejs/vine";
import { newsSchema } from "../validations/NewsValidation.js";

class NewsController {
  static async index(req, res) {}

  static async store(req, res, next) {
    const user = req.user
    const body = req.body
    const validator = vine.compile(newsSchema)
    const payload = await validator.validate(body)
  }

  static async show(req, res, next) {}

  static async update(req, res, next) {}

  static async destroy(req, res, next) {}
}
