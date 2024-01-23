import Express from "express";
import "dotenv/config";
import ApiRoutes from "./routes/api.js";

const app = Express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.json({ First_Message: "Yoo! You got This" });
});

// import routes
app.use("/api", ApiRoutes)

app.listen(PORT, console.log(`Server is running on ${PORT}`));
