import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

// Enable CORS for specified origin (helps control which client domains can access the API)
app.use(cors({
    origin: process.env.CORS_ORIGIN
}));

// Parse incoming JSON requests (with a size limit to prevent large payload attacks)
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded form data (supports nested objects; size limit applied)
app.use(urlencoded({ extended: true, limit: "16kb" }));

// Serve static files (images, CSS, JS, etc.) from the "public" directory
app.use(express.static("public"));

// Parse cookies attached to client requests (enables reading & modifying cookies)
app.use(cookieParser());

// Routes
import userRouter from "./routes/user.route.js";

// Routes declaration
app.use("/api/users", userRouter);

export { app };
