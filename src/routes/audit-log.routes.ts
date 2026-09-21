import { Router } from "express";
import { RbacAuditLogController } from "../controllers/RbacAuditLogController";

const router = Router();
const controller = new RbacAuditLogController();

router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.criar);
router.delete("/:id", controller.remover);

export default router;
