import { Router } from "express";
import { registerUser, loginUser, profile, logoutUser } from "./auth.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/profile", verifyToken, profile);

export default router;