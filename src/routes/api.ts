import { Router } from "express";
import dummyController from "../controllers/dummy.controller";

const router = Router()
router.get("/dummy", dummyController.getDummy)

export default router