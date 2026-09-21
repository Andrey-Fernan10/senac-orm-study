import { Router } from "express";
import { UserRoleController } from "../controllers/UserRoleController";

const router = Router();
const controller = new UserRoleController();

router.get("/", controller.listar);
router.get("/:userId/:roleId", controller.buscarPorIds);
router.post("/", controller.criar);
router.delete("/:userId/:roleId", controller.remover);

export default router;
