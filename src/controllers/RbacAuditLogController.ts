import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { RbacAuditLog } from "../models/entities/RbacAuditLog";
import { BaseController } from "./BaseController";

/**
 * Logs de auditoria: listagem, consulta e criação.
 * Em geral não se atualiza um registro de auditoria.
 */
export class RbacAuditLogController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(RbacAuditLog);
  }

  listar = this.handle(async (_req: Request, res: Response) => {
    const logs = await this.repository.find({
      order: { createdAt: "DESC" },
      relations: {
        user: true,
        targetUser: true,
        targetRole: true,
        targetPermission: true,
      },
    });
    this.ok(res, logs);
  });

  buscarPorId = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const log = await this.repository.findOne({
      where: { id },
      relations: {
        user: true,
        targetUser: true,
        targetRole: true,
        targetPermission: true,
      },
    });

    if (!log) {
      this.notFound(res, `Log ${id} não encontrado`);
      return;
    }

    this.ok(res, log);
  });

  criar = this.handle(async (req: Request, res: Response) => {
    const {
      userId,
      actionType,
      targetUserId,
      targetRoleId,
      targetPermissionId,
      ipAddress,
    } = req.body;

    if (!actionType) {
      this.badRequest(res, "Campos obrigatórios: actionType");
      return;
    }

    const log = this.repository.create({
      userId: userId ?? null,
      actionType,
      targetUserId: targetUserId ?? null,
      targetRoleId: targetRoleId ?? null,
      targetPermissionId: targetPermissionId ?? null,
      ipAddress: ipAddress ?? null,
    });

    const salvo = await this.repository.save(log);
    this.created(res, salvo);
  });

  remover = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const log = await this.repository.findOneBy({ id });

    if (!log) {
      this.notFound(res, `Log ${id} não encontrado`);
      return;
    }

    await this.repository.remove(log);
    this.ok(res, { message: `Log ${id} removido` });
  });
}
