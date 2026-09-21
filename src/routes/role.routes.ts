import { Router } from "express";
import { RoleController } from "../controllers/RoleController";

const router = Router();
const controller = new RoleController();

router.get("/", controller.list);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
