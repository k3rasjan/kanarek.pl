import { Router } from "express";
import inspectorRouter from "./inspector";
import vehiclesRouter from "./vehicles";

const router = Router();
router.use("/inspector", inspectorRouter);
router.use("/vehicles", vehiclesRouter);
export default router;
