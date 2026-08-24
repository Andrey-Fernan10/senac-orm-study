# Passo a passo: criar uma nova API REST

Este guia explica como expor uma entidade (tabela) como **API JSON** no projeto **senac-orm**, seguindo a arquitetura MVC.

> **Camadas envolvidas:** Controller (`src/controllers/`) + Routes (`src/routes/`) + View (`src/views/`)

---

## Visão geral do fluxo

```
Requisição HTTP
      │
      ▼
  Routes (src/routes/)          ← define URL e método HTTP
      │
      ▼
  Controller (src/controllers/) ← lógica da requisição
      │
      ▼
  Model / TypeORM               ← acesso ao banco (entidade)
      │
      ▼
  View JSON (src/views/)        ← resposta padronizada
      │
      ▼
Resposta JSON
```

**Exemplo:** `GET /api/produtos/1` → `ProdutoController.buscarPorId` → consulta `Produto` no banco → retorna JSON.

---

## Pré-requisitos

- Entidade já mapeada em `src/models/entities/` (veja [Mapear nova tabela](./mapear-nova-tabela.md))
- API rodando com `npm run dev`

Neste guia usaremos a entidade **`Produto`** como exemplo.

---

## Passo 1 — Criar o Controller

Crie o arquivo:

```
src/controllers/ProdutoController.ts
```

O controller **herda de `BaseController`**, que já fornece:

- `this.handle()` — tratamento de erros async
- `this.ok()` — resposta 200
- `this.created()` — resposta 201
- `this.notFound()` — resposta 404
- `this.badRequest()` — resposta 400

### Estrutura base

```typescript
import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Produto } from "../models/entities/Produto";
import { BaseController } from "./BaseController";

export class ProdutoController extends BaseController {
  private get repository() {
    return AppDataSource.getRepository(Produto);
  }

  // Métodos CRUD aqui...
}
```

O `repository` é a ponte entre o controller e o banco. Ele usa a entidade `Produto` para executar operações SQL.

---

## Passo 2 — Implementar as ações CRUD

Cada ação é um método do controller, envolvido por `this.handle()`.

### Listar todos — `GET /api/produtos`

```typescript
listar = this.handle(async (_req: Request, res: Response) => {
  const produtos = await this.repository.find({
    order: { id: "ASC" },
  });
  this.ok(res, produtos);
});
```

### Buscar por ID — `GET /api/produtos/:id`

```typescript
buscarPorId = this.handle(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    this.badRequest(res, "ID inválido");
    return;
  }

  const produto = await this.repository.findOneBy({ id });

  if (!produto) {
    this.notFound(res, `Produto ${id} não encontrado`);
    return;
  }

  this.ok(res, produto);
});
```

### Criar — `POST /api/produtos`

```typescript
criar = this.handle(async (req: Request, res: Response) => {
  const { nome, preco, estoque } = req.body;

  if (!nome || preco === undefined) {
    this.badRequest(res, "Campos obrigatórios: nome, preco");
    return;
  }

  const produto = this.repository.create({
    nome,
    preco,
    estoque: estoque ?? 0,
  });

  const salvo = await this.repository.save(produto);
  this.created(res, salvo);
});
```

### Atualizar — `PUT /api/produtos/:id`

```typescript
atualizar = this.handle(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    this.badRequest(res, "ID inválido");
    return;
  }

  const produto = await this.repository.findOneBy({ id });

  if (!produto) {
    this.notFound(res, `Produto ${id} não encontrado`);
    return;
  }

  const { nome, preco, estoque } = req.body;

  if (nome !== undefined) produto.nome = nome;
  if (preco !== undefined) produto.preco = preco;
  if (estoque !== undefined) produto.estoque = estoque;

  const atualizado = await this.repository.save(produto);
  this.ok(res, atualizado);
});
```

### Remover — `DELETE /api/produtos/:id`

```typescript
remover = this.handle(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    this.badRequest(res, "ID inválido");
    return;
  }

  const produto = await this.repository.findOneBy({ id });

  if (!produto) {
    this.notFound(res, `Produto ${id} não encontrado`);
    return;
  }

  await this.repository.remove(produto);
  this.ok(res, { message: `Produto ${id} removido` });
});
```

---

## Passo 3 — Criar o arquivo de rotas

Crie:

```
src/routes/produto.routes.ts
```

```typescript
import { Router } from "express";
import { ProdutoController } from "../controllers/ProdutoController";

const router = Router();
const controller = new ProdutoController();

router.get("/", controller.listar);
router.get("/:id", controller.buscarPorId);
router.post("/", controller.criar);
router.put("/:id", controller.atualizar);
router.delete("/:id", controller.remover);

export default router;
```

### Convenção REST

| Método HTTP | Rota            | Ação do controller | Descrição        |
|-------------|-----------------|--------------------|------------------|
| `GET`       | `/produtos`     | `listar`           | Lista todos      |
| `GET`       | `/produtos/:id` | `buscarPorId`      | Busca um         |
| `POST`      | `/produtos`     | `criar`            | Cria novo        |
| `PUT`       | `/produtos/:id` | `atualizar`        | Atualiza existente |
| `DELETE`    | `/produtos/:id` | `remover`          | Remove           |

> Use substantivos no plural (`/produtos`, `/usuarios`), nunca verbos (`/listarProdutos`).

---

## Passo 4 — Registrar as rotas na aplicação

Abra `src/routes/index.ts` e adicione o novo módulo:

```typescript
import { Router } from "express";
import usuarioRoutes from "./usuario.routes";
import produtoRoutes from "./produto.routes";  // ← importar

const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      message: "API senac-orm em execução",
    },
  });
});

routes.use("/usuarios", usuarioRoutes);
routes.use("/produtos", produtoRoutes);  // ← registrar

export default routes;
```

Todas as rotas ficam sob o prefixo `/api` (definido em `src/app.ts`).

URL final: **`http://localhost:3000/api/produtos`**

---

## Passo 5 — Reiniciar e testar

Reinicie o servidor:

```bash
npm run dev
```

### Testes com curl

**Listar produtos:**

```bash
curl http://localhost:3000/api/produtos
```

**Criar produto:**

```bash
curl -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Notebook","preco":3500.00,"estoque":10}'
```

**Buscar por ID:**

```bash
curl http://localhost:3000/api/produtos/1
```

**Atualizar:**

```bash
curl -X PUT http://localhost:3000/api/produtos/1 \
  -H "Content-Type: application/json" \
  -d '{"preco":3200.00,"estoque":8}'
```

**Remover:**

```bash
curl -X DELETE http://localhost:3000/api/produtos/1
```

---

## Passo 6 — Entender o formato das respostas (View JSON)

Todas as respostas passam pela `JsonView` (`src/views/JsonView.ts`).

### Sucesso (200 / 201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Notebook",
    "preco": "3500.00",
    "estoque": 10,
    "criadoEm": "2026-08-24T20:00:00.000Z"
  }
}
```

### Erro de validação (400)

```json
{
  "success": false,
  "error": {
    "message": "Campos obrigatórios: nome, preco"
  }
}
```

### Não encontrado (404)

```json
{
  "success": false,
  "error": {
    "message": "Produto 99 não encontrado"
  }
}
```

O controller **nunca** chama `res.json()` diretamente. Use sempre os métodos herdados de `BaseController` (`ok`, `created`, `notFound`, `badRequest`).

---

## Resumo dos arquivos criados

Para cada novo recurso (ex.: `Produto`), você cria ou altera:

| # | Arquivo                              | Ação                          |
|---|--------------------------------------|-------------------------------|
| 1 | `src/models/entities/Produto.ts`     | Entidade (tabela)             |
| 2 | `src/models/index.ts`                | Exportar entidade             |
| 3 | `src/controllers/ProdutoController.ts`| Lógica CRUD                  |
| 4 | `src/routes/produto.routes.ts`       | Rotas HTTP                    |
| 5 | `src/routes/index.ts`                | Registrar rotas no app        |

---

## Checklist final

- [ ] Entidade criada em `src/models/entities/`
- [ ] Controller criado herdando `BaseController`
- [ ] Métodos CRUD implementados com `this.handle()`
- [ ] Validação de campos obrigatórios no `criar`
- [ ] Validação de ID numérico nos métodos com `:id`
- [ ] Arquivo de rotas criado com verbos HTTP corretos
- [ ] Rotas registradas em `src/routes/index.ts`
- [ ] API testada com curl ou Postman/Insomnia
- [ ] Respostas JSON no formato `{ success, data }` ou `{ success, error }`

---

## Referência: implementação existente

O recurso **Usuário** já está completo no projeto. Use como modelo:

| Arquivo | Caminho |
|---------|---------|
| Entidade | `src/models/entities/Usuario.ts` |
| Controller | `src/controllers/UsuarioController.ts` |
| Rotas | `src/routes/usuario.routes.ts` |
| Registro | `src/routes/index.ts` |

---

## Guia relacionado

Se ainda não mapeou a tabela no banco, comece por:

**[Mapear uma nova tabela](./mapear-nova-tabela.md)**
