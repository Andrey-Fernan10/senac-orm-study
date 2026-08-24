# Senac ORM — Boilerplate MVC + TypeORM

API REST em **Node.js + Express + TypeScript** organizada em arquitetura **MVC**, pensada para a disciplina de Banco de Dados. O objetivo é mostrar na prática como um **ORM** (Object-Relational Mapping) mapeia classes TypeScript em tabelas SQL.

## Arquitetura MVC

```
src/
├── config/
│   └── database.ts          → conexão TypeORM (Model)
├── models/
│   ├── entities/            → classes = tabelas do banco
│   │   └── Usuario.ts
│   └── index.ts
├── views/
│   └── JsonView.ts          → respostas apenas em JSON
├── controllers/
│   ├── BaseController.ts    → base organizada para CRUD
│   └── UsuarioController.ts → exemplo completo
├── routes/
│   ├── index.ts
│   └── usuario.routes.ts
├── app.ts                   → Express
└── server.ts                → sobe a API + conecta o banco
```

| Camada       | Pasta              | Responsabilidade                                      |
|--------------|--------------------|-------------------------------------------------------|
| **Model**    | `models/`, `config/` | Conexão com o banco e entidades (tabelas)            |
| **View**     | `views/`           | Formato JSON padronizado das respostas                |
| **Controller** | `controllers/`   | Recebe a requisição, usa o Model, devolve via View    |

## Pré-requisitos

- Node.js 18+
- Um banco SQL (MySQL, MariaDB, PostgreSQL ou SQLite)

## Como usar

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o banco

Copie o arquivo de exemplo e preencha **apenas** os dados de conexão:

```bash
cp .env.example .env
```

Variáveis principais:

| Variável       | Exemplo        | Descrição                          |
|----------------|----------------|------------------------------------|
| `DB_TYPE`      | `mysql`        | `mysql`, `mariadb`, `postgres`, `sqlite` |
| `DB_HOST`      | `localhost`    | Host do servidor                   |
| `DB_PORT`      | `3306`         | Porta (5432 no Postgres)           |
| `DB_NAME`      | `senac_orm`    | Nome do banco (crie-o antes)       |
| `DB_USER`      | `root`         | Usuário                            |
| `DB_PASSWORD`  |                | Senha                              |
| `DB_SYNC`      | `true`         | Cria/atualiza tabelas pelas entidades (só em aula/dev) |
| `DB_LOGGING`   | `true`         | Mostra o SQL gerado pelo ORM no console |

> Com `DB_SYNC=true`, o TypeORM cria a tabela `usuarios` automaticamente a partir da entidade. Ideal para a aula; em produção use migrations.

### 3. Rodar a API

```bash
npm run dev
```

Acesse: http://localhost:3000/api/health

## Endpoints de exemplo (Usuário)

| Método   | URL                    | Ação              |
|----------|------------------------|-------------------|
| `GET`    | `/api/usuarios`        | Listar todos      |
| `GET`    | `/api/usuarios/:id`    | Buscar por ID     |
| `POST`   | `/api/usuarios`        | Criar             |
| `PUT`    | `/api/usuarios/:id`    | Atualizar         |
| `DELETE` | `/api/usuarios/:id`    | Remover           |

Exemplo de criação:

```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Silva","email":"maria@email.com"}'
```

Resposta (View JSON):

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "ativo": true,
    "criadoEm": "2026-08-24T20:00:00.000Z",
    "atualizadoEm": "2026-08-24T20:00:00.000Z"
  }
}
```

## Criar uma nova tabela (entidade)

1. Crie um arquivo em `src/models/entities/`, por exemplo `Produto.ts`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("produtos")
export class Produto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  nome!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  preco!: number;
}
```

2. Exporte em `src/models/index.ts` (opcional, para organização).
3. Crie um Controller em `src/controllers/` herdando de `BaseController`.
4. Crie as rotas em `src/routes/` e registre em `src/routes/index.ts`.

Com `DB_SYNC=true`, a tabela `produtos` será criada na próxima execução.

## O que o aluno deve observar

- A classe `Usuario` **não** escreve SQL manualmente: o TypeORM gera `INSERT`, `SELECT`, etc.
- Com `DB_LOGGING=true`, o SQL aparece no terminal — compare a classe com o SQL gerado.
- Decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`) definem o mapeamento objeto ↔ tabela.

## Scripts

| Comando        | Descrição                    |
|----------------|------------------------------|
| `npm run dev`  | Desenvolvimento (hot reload) |
| `npm run build`| Compila TypeScript → `dist/` |
| `npm start`    | Executa a build compilada    |
