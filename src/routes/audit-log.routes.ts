import { Router } from "express";
import { RbacAuditLogController } from "../controllers/RbacAuditLogController";

const router = Router();
const controller = new RbacAuditLogController();

router.get("/", controller.list);
router.get("/:id", controller.findById);
router.post("/", controller.create);
router.delete("/:id", controller.remove);

export default router;
