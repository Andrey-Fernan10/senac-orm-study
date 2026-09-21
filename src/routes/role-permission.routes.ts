import { Router } from "express";
import { RolePermissionController } from "../controllers/RolePermissionController";

const router = Router();
const controller = new RolePermissionController();

router.get("/", controller.list);
router.get("/:roleId/:permissionId", controller.findByIds);
router.post("/", controller.create);
router.delete("/:roleId/:permissionId", controller.remove);

export default router;
