import { Router } from "express";
import { RolePermissionController } from "../controllers/RolePermissionController";

const router = Router();
const controller = new RolePermissionController();

router.get("/", controller.listar);
router.get("/:roleId/:permissionId", controller.buscarPorIds);
router.post("/", controller.criar);
router.delete("/:roleId/:permissionId", controller.remover);

export default router;
