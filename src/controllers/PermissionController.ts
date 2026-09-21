import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Permission } from "../models/entities/Permission";
import { BaseController } from "./BaseController";

export class PermissionController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(Permission);
  }

  list = this.handle(async (_req: Request, res: Response) => {
    const permissions = await this.repository.find({
      order: { resource: "ASC", action: "ASC" },
    });
    this.ok(res, permissions);
  });

  findById = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const permission = await this.repository.findOne({
      where: { id },
      relations: { rolePermissions: { role: true } },
    });

    if (!permission) {
      this.notFound(res, `Permissão ${id} não encontrada`);
      return;
    }

    this.ok(res, permission);
  });

  create = this.handle(async (req: Request, res: Response) => {
    const { name, resource, action, description } = req.body;

    if (!name || !resource || !action) {
      this.badRequest(res, "Campos obrigatórios: name, resource, action");
      return;
    }

    const permission = this.repository.create({
      name,
      resource,
      action,
      description: description ?? null,
    });

    const saved = await this.repository.save(permission);
    this.created(res, saved);
  });

  update = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const permission = await this.repository.findOneBy({ id });

    if (!permission) {
      this.notFound(res, `Permissão ${id} não encontrada`);
      return;
    }

    const { name, resource, action, description } = req.body;

    if (name !== undefined) permission.name = name;
    if (resource !== undefined) permission.resource = resource;
    if (action !== undefined) permission.action = action;
    if (description !== undefined) permission.description = description;

    const updated = await this.repository.save(permission);
    this.ok(res, updated);
  });

  remove = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const permission = await this.repository.findOneBy({ id });

    if (!permission) {
      this.notFound(res, `Permissão ${id} não encontrada`);
      return;
    }

    await this.repository.remove(permission);
    this.ok(res, { message: `Permissão ${id} removida` });
  });
}
