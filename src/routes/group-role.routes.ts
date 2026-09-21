import { Router } from "express";
import { GroupRoleController } from "../controllers/GroupRoleController";

const router = Router();
const controller = new GroupRoleController();

router.get("/", controller.listar);
router.get("/:groupId/:roleId", controller.buscarPorIds);
router.post("/", controller.criar);
router.delete("/:groupId/:roleId", controller.remover);

export default router;
