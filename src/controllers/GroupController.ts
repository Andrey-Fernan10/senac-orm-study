import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Group } from "../models/entities/Group";
import { BaseController } from "./BaseController";

export class GroupController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(Group);
  }

  list = this.handle(async (_req: Request, res: Response) => {
    const groups = await this.repository.find({
      order: { name: "ASC" },
      relations: { userGroups: true, groupRoles: true },
    });
    this.ok(res, groups);
  });

  findById = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const group = await this.repository.findOne({
      where: { id },
      relations: {
        userGroups: { user: true },
        groupRoles: { role: true },
      },
    });

    if (!group) {
      this.notFound(res, `Grupo ${id} não encontrado`);
      return;
    }

    this.ok(res, group);
  });

  create = this.handle(async (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name) {
      this.badRequest(res, "Campos obrigatórios: name");
      return;
    }

    const group = this.repository.create({
      name,
      description: description ?? null,
    });

    const saved = await this.repository.save(group);
    this.created(res, saved);
  });

  update = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const group = await this.repository.findOneBy({ id });

    if (!group) {
      this.notFound(res, `Grupo ${id} não encontrado`);
      return;
    }

    const { name, description } = req.body;

    if (name !== undefined) group.name = name;
    if (description !== undefined) group.description = description;

    const updated = await this.repository.save(group);
    this.ok(res, updated);
  });

  remove = this.handle(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const group = await this.repository.findOneBy({ id });

    if (!group) {
      this.notFound(res, `Grupo ${id} não encontrado`);
      return;
    }

    await this.repository.remove(group);
    this.ok(res, { message: `Grupo ${id} removido` });
  });
}
