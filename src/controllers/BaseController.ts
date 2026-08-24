import { Request, Response, NextFunction } from "express";
import { JsonView } from "../views/JsonView";

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

/**
 * Camada Controller — classe base.
 *
 * Controllers concretos herdam desta classe e implementam
 * as ações (listar, buscar, criar, atualizar, remover).
 * A View JSON é usada para padronizar as respostas.
 */
export abstract class BaseController {
  /**
   * Envolve handlers async e encaminha erros para o middleware global.
   */
  protected handle(fn: AsyncHandler): AsyncHandler {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (error) {
        next(error);
      }
    };
  }

  protected ok<T>(res: Response, data: T): Response {
    return JsonView.success(res, data);
  }

  protected created<T>(res: Response, data: T): Response {
    return JsonView.created(res, data);
  }

  protected notFound(res: Response, message?: string): Response {
    return JsonView.notFound(res, message);
  }

  protected badRequest(res: Response, message: string, details?: unknown): Response {
    return JsonView.error(res, message, 400, details);
  }
}
