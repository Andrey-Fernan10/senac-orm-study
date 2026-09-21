import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Role } from "../models/entities/Role";
import { BaseController } from "./BaseController";

export class RoleController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(Role);
  }

  list = this.handle(async (_req: Request, res: Response) => {
    const roles = await this.repository.find({
      order: { name: "ASC" },
      relations: { rolePermissions: true },
    });
    this.ok(res, roles);
  });

  findById = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const role = await this.repository.findOne({
      where: { id },
      relations: {
        rolePermissions: { permission: true },
        userRoles: true,
        groupRoles: true,
      },
    });

    if (!role) {
      this.notFound(res, `Papel ${id} não encontrado`);
      return;
    }

    this.ok(res, role);
  });

  create = this.handle(async (req: Request, res: Response) => {
    const { name, description, isSystem } = req.body;

    if (!name) {
      this.badRequest(res, "Campos obrigatórios: name");
      return;
    }

    const role = this.repository.create({
      name,
      description: description ?? null,
      isSystem: isSystem ?? false,
    });

    const saved = await this.repository.save(role);
    this.created(res, saved);
  });

  update = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const role = await this.repository.findOneBy({ id });

    if (!role) {
      this.notFound(res, `Papel ${id} não encontrado`);
      return;
    }

    const { name, description, isSystem } = req.body;

    if (name !== undefined) role.name = name;
    if (description !== undefined) role.description = description;
    if (isSystem !== undefined) role.isSystem = isSystem;

    const updated = await this.repository.save(role);
    this.ok(res, updated);
  });

  remove = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const role = await this.repository.findOneBy({ id });

    if (!role) {
      this.notFound(res, `Papel ${id} não encontrado`);
      return;
    }

    if (role.isSystem) {
      this.badRequest(res, "Papéis de sistema não podem ser removidos");
      return;
    }

    await this.repository.remove(role);
    this.ok(res, { message: `Papel ${id} removido` });
  });
}
