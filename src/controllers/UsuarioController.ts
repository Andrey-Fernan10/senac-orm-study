import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Usuario } from "../models/entities/Usuario";
import { BaseController } from "./BaseController";

/**
 * Controller de exemplo para a entidade Usuario.
 * Demonstra o CRUD básico usando o repositório do TypeORM.
 */
export class UsuarioController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(Usuario);
  }

  listar = this.handle(async (_req: Request, res: Response) => {
    const usuarios = await this.repository.find({
      order: { id: "ASC" },
    });
    this.ok(res, usuarios);
  });

  buscarPorId = this.handle(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const usuario = await this.repository.findOneBy({ id });

    if (!usuario) {
      this.notFound(res, `Usuário ${id} não encontrado`);
      return;
    }

    this.ok(res, usuario);
  });

  criar = this.handle(async (req: Request, res: Response) => {
    const { nome, email, ativo } = req.body;

    if (!nome || !email) {
      this.badRequest(res, "Campos obrigatórios: nome, email");
      return;
    }

    const usuario = this.repository.create({
      nome,
      email,
      ativo: ativo ?? true,
    });

    const salvo = await this.repository.save(usuario);
    this.created(res, salvo);
  });

  atualizar = this.handle(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const usuario = await this.repository.findOneBy({ id });

    if (!usuario) {
      this.notFound(res, `Usuário ${id} não encontrado`);
      return;
    }

    const { nome, email, ativo } = req.body;

    if (nome !== undefined) usuario.nome = nome;
    if (email !== undefined) usuario.email = email;
    if (ativo !== undefined) usuario.ativo = ativo;

    const atualizado = await this.repository.save(usuario);
    this.ok(res, atualizado);
  });

  remover = this.handle(async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      this.badRequest(res, "ID inválido");
      return;
    }

    const usuario = await this.repository.findOneBy({ id });

    if (!usuario) {
      this.notFound(res, `Usuário ${id} não encontrado`);
      return;
    }

    await this.repository.remove(usuario);
    this.ok(res, { message: `Usuário ${id} removido` });
  });
}
