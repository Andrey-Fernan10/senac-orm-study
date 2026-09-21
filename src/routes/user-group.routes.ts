import { Router } from "express";
import { UserGroupController } from "../controllers/UserGroupController";

const router = Router();
const controller = new UserGroupController();

router.get("/", controller.list);
router.get("/:userId/:groupId", controller.findByIds);
router.post("/", controller.create);
router.delete("/:userId/:groupId", controller.remove);

export default router;
