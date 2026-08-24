import "reflect-metadata";
import dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";

dotenv.config();

/**
 * Camada Model — Abstração da conexão com o banco de dados.
 *
 * O desenvolvedor precisa informar apenas as variáveis no arquivo .env
 * (veja .env.example). Toda a configuração do TypeORM fica centralizada aqui.
 */
function buildDataSourceOptions(): DataSourceOptions {
  const type = (process.env.DB_TYPE || "mysql") as
    | "mysql"
    | "mariadb"
    | "postgres"
    | "sqlite";

  const entities = [path.join(__dirname, "../models/entities/**/*.{ts,js}")];

  const common = {
    entities,
    synchronize: process.env.DB_SYNC === "true",
    logging: process.env.DB_LOGGING === "true",
  };

  if (type === "sqlite") {
    return {
      type: "sqlite",
      database: process.env.DB_NAME || "database.sqlite",
      ...common,
    };
  }

  return {
    type,
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || (type === "postgres" ? 5432 : 3306),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "senac_orm",
    ...common,
  };
}

export const AppDataSource = new DataSource(buildDataSourceOptions());

/**
 * Inicializa a conexão com o banco.
 * Chame uma vez na subida da aplicação (server.ts).
 */
export async function connectDatabase(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  await AppDataSource.initialize();
  console.log(`[Model] Conectado ao banco (${process.env.DB_TYPE || "mysql"})`);
  return AppDataSource;
}
