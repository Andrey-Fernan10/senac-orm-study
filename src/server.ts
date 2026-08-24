import "reflect-metadata";
import dotenv from "dotenv";
import { createApp } from "./app";
import { connectDatabase } from "./config/database";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;

async function bootstrap() {
  try {
    await connectDatabase();

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`[Server] API rodando em http://localhost:${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/api/health`);
      console.log(`[Server] Usuários: http://localhost:${PORT}/api/usuarios`);
    });
  } catch (error) {
    console.error("[Server] Falha ao iniciar a aplicação:", error);
    process.exit(1);
  }
}

bootstrap();
