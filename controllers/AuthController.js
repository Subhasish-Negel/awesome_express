import { prisma } from "../db/db.config.js";
import vine, { errors } from "@vinejs/vine";
import { registerSchema } from "../validations/authValidation.js";

class AuthController {
  static async register(req, res) {
    const body = req.body;
    try {
      const validator = vine.validate(registerSchema);
      const payload = validator.validate(body);
      return res.json({ payload });
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        // console.log(error.messages);
        return res.status(400).json({ errors: error.messages });
      }
    }
  }
}

export default AuthController;
