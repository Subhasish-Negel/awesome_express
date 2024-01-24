import express from "express";
import "dotenv/config";
import ApiRoutes from "./routes/api.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middileware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.json({ First_Message: "Yoo! You got This" });
});


app.use("/api", ApiRoutes);

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
