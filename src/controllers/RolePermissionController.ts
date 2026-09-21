import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { RolePermission } from "../models/entities/RolePermission";
import { Role } from "../models/entities/Role";
import { Permission } from "../models/entities/Permission";
import { BaseController } from "./BaseController";

export class RolePermissionController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(RolePermission);
  }

  listar = this.handle(async (_req: Request, res: Response) => {
    const items = await this.repository.find({
      order: { grantedAt: "DESC" },
      relations: { role: true, permission: true },
    });
    this.ok(res, items);
  });

  buscarPorIds = this.handle(async (req: Request, res: Response) => {
    const { roleId, permissionId } = req.params;

    if (!roleId || !permissionId) {
      this.badRequest(res, "Parâmetros obrigatórios: roleId, permissionId");
      return;
    }

    const item = await this.repository.findOne({
      where: { roleId, permissionId },
      relations: { role: true, permission: true },
    });

    if (!item) {
      this.notFound(res, "Vínculo papel-permissão não encontrado");
      return;
    }

    this.ok(res, item);
  });

  criar = this.handle(async (req: Request, res: Response) => {
    const { roleId, permissionId } = req.body;

    if (!roleId || !permissionId) {
      this.badRequest(res, "Campos obrigatórios: roleId, permissionId");
      return;
    }

    const role = await AppDataSource.getRepository(Role).findOneBy({ id: roleId });
    if (!role) {
      this.notFound(res, `Papel ${roleId} não encontrado`);
      return;
    }

    const permission = await AppDataSource.getRepository(Permission).findOneBy({
      id: permissionId,
    });
    if (!permission) {
      this.notFound(res, `Permissão ${permissionId} não encontrada`);
      return;
    }

    const existente = await this.repository.findOneBy({ roleId, permissionId });
    if (existente) {
      this.badRequest(res, "Esta permissão já está atribuída ao papel");
      return;
    }

    const item = this.repository.create({ roleId, permissionId });
    const salvo = await this.repository.save(item);
    this.created(res, salvo);
  });

  remover = this.handle(async (req: Request, res: Response) => {
    const { roleId, permissionId } = req.params;

    if (!roleId || !permissionId) {
      this.badRequest(res, "Parâmetros obrigatórios: roleId, permissionId");
      return;
    }

    const item = await this.repository.findOneBy({ roleId, permissionId });

    if (!item) {
      this.notFound(res, "Vínculo papel-permissão não encontrado");
      return;
    }

    await this.repository.remove(item);
    this.ok(res, { message: "Permissão removida do papel" });
  });
}
