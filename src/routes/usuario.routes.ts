import { Router } from "express";
import { UsuarioController } from "../controllers/UsuarioController";

const router = Router();
const controller = new UsuarioController();

/**
 * Rotas REST do recurso Usuário.
 * GET    /usuarios      → listar
 * GET    /usuarios/:id  → buscar por id
 * POST   /usuarios      → criar
 * PUT    /usuarios/:id  → atualizar
 * DELETE /usuarios/:id  → remover
 */
router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

export default router;
