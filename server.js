import express from "express";
import "dotenv/config";
import ApiRoutes from "./routes/api.js";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { limiter } from "./config/spamLimiter.js";
import logger from "./config/logger.js";
const app = express();
const PORT = process.env.PORT || 8000;

// Middileware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public/images"));
app.use(fileUpload());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(limiter);

app.get("/", (req, res) => {
  res.json({ First_Message: "Yoo! You got This" });
});

app.use("/api", ApiRoutes);

// logger
logger.info("Hey I am just testing fr fr");

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
