import { Router } from "express";
import usuarioRoutes from "./usuario.routes";

const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      message: "API senac-orm em execução",
    },
  });
});

routes.use("/usuarios", usuarioRoutes);

export default routes;
