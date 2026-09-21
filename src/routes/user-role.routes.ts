import { Router } from "express";
import { UserRoleController } from "../controllers/UserRoleController";

const router = Router();
const controller = new UserRoleController();

router.get("/", controller.list);
router.get("/:userId/:roleId", controller.findByIds);
router.post("/", controller.create);
router.delete("/:userId/:roleId", controller.remove);

export default router;
