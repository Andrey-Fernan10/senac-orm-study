import { Router } from "express";
import { RoleController } from "../controllers/RoleController";

const router = Router();
const controller = new RoleController();

router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

export default router;
