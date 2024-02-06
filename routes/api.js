import { Router } from "express";
import AuthController from "../controllers/AuthController.js";
import ProfileController from "../controllers/ProfileController.js";
import authMiddlware from "../middlewares/Authentication.js";
import { NewsController } from "../controllers/NewsController.js";

const router = Router();

// Account Signup & Login
router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);

// Profile Operations
router.get("/profile", authMiddlware, ProfileController.index); // Protected Route
router.put("/profile/update/:id", authMiddlware, ProfileController.update);

// News API
router.get("/news", NewsController.index);
router.post("/news/create", authMiddlware, NewsController.store);
router.get("/news/:id", NewsController.show);
router.put("/news/update/:id", NewsController.update);
router.delete("/news/delete/:id", NewsController.destroy);

export default router;
