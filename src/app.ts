import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import routes from "./routes";
import { JsonView } from "./views/JsonView";

/**
 * Configuração da aplicação Express (API JSON).
 */
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Garante Content-Type JSON nas respostas
  app.use((_req, res, next) => {
    res.type("application/json");
    next();
  });

  app.use("/api", routes);

  app.use((_req, res) => {
    JsonView.notFound(res, "Rota não encontrada");
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("[Erro]", err.message);
    JsonView.serverError(res, err.message || "Erro interno do servidor");
  });

  return app;
}
