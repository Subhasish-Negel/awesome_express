import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/ProfileController.js";
import authMiddlware from "../middlewares/Authentication.js";

const router = Router();

// Account Signup & Login
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

// Profile Operations
router.get("/profile", authMiddlware, ProfileController.index); // Protected Route
router.put("/profile/update/:id", authMiddlware, ProfileController.update);

export default router;
