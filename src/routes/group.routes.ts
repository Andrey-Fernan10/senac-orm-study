import { Router } from "express";
import { GroupController } from "../controllers/GroupController";

const router = Router();
const controller = new GroupController();

router.get("/", controller.list);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.put("/:id", controller.update);
router.delete("/:id", controller.remove);

export default router;
