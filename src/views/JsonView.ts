import { Response } from "express";

/**
 * Camada View — exclusivamente JSON.
 *
 * Centraliza o formato das respostas da API para manter
 * consistência entre todos os controllers.
 */
export class JsonView {
  static success<T>(res: Response, data: T, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  static error(
    res: Response,
    message: string,
    statusCode = 400,
    details?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(details !== undefined ? { details } : {}),
      },
    });
  }

  static notFound(res: Response, message = "Recurso não encontrado"): Response {
    return this.error(res, message, 404);
  }

  static serverError(res: Response, message = "Erro interno do servidor"): Response {
    return this.error(res, message, 500);
  }
}
