import { Router } from "express";
import { UserGroupController } from "../controllers/UserGroupController";

const router = Router();
const controller = new UserGroupController();

router.get("/", controller.listar);
router.get("/:userId/:groupId", controller.buscarPorIds);
router.post("/", controller.criar);
router.delete("/:userId/:groupId", controller.remover);

export default router;
