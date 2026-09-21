import { Router } from "express";
import { GroupRoleController } from "../controllers/GroupRoleController";

const router = Router();
const controller = new GroupRoleController();

router.get("/", controller.list);
router.get("/:groupId/:roleId", controller.findByIds);
router.post("/", controller.create);
router.delete("/:groupId/:roleId", controller.remove);

export default router;
