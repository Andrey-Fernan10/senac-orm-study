import { Router } from "express";
import { PermissionController } from "../controllers/PermissionController";

const router = Router();
const controller = new PermissionController();

router.get("/", controller.list);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
