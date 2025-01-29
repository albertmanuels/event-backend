import { Router } from "express";
import authController from "../controllers/auth.controller";
import authMiddleware from "../middlewares/auth.middleware"


const router = Router()
router.post("/auth/login", authController.login)
router.post("/auth/register", authController.register)
router.get("/auth/me", authMiddleware, authController.me)

export default router