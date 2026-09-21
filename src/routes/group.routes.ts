import { Router } from "express";
import { GroupController } from "../controllers/GroupController";

const router = Router();
const controller = new GroupController();

router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

export default router;
