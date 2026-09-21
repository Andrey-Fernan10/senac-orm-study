import { Router } from "express";
import { PermissionController } from "../controllers/PermissionController";

const router = Router();
const controller = new PermissionController();

router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

export default router;
