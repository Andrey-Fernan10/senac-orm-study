# Passo a passo: mapear uma nova tabela do banco de dados

Este guia explica como transformar uma tabela SQL em uma **entidade TypeORM** no projeto **senac-orm**.

> **Camada envolvida:** Model (`src/models/`)

---

## O que é mapeamento ORM?

No ORM (Object-Relational Mapping), cada **tabela** do banco vira uma **classe TypeScript**, e cada **coluna** vira uma **propriedade** da classe.

```
Tabela SQL "produtos"     →     Classe TypeScript Produto
─────────────────────           ─────────────────────────
id (INT, PK)                    @PrimaryGeneratedColumn() id
nome (VARCHAR)                  @Column() nome
preco (DECIMAL)                 @Column() preco
```

O TypeORM usa os **decorators** (`@Entity`, `@Column`, etc.) para entender esse mapeamento e gerar o SQL automaticamente.

---

## Pré-requisitos

- Projeto configurado com `.env` preenchido (veja `.env.example`)
- Banco de dados acessível
- `DB_SYNC=true` no `.env` (em ambiente de aula/desenvolvimento)

Com `DB_SYNC=true`, ao reiniciar a API o TypeORM **cria ou atualiza** a tabela com base na entidade. Não é necessário escrever `CREATE TABLE` manualmente durante a aula.

---

## Passo 1 — Definir a tabela no papel (modelo conceitual)

Antes de codificar, desenhe a tabela. Exemplo:

| Coluna       | Tipo SQL        | Restrições        | Descrição              |
|--------------|-----------------|-------------------|------------------------|
| `id`         | INT             | PK, AUTO_INCREMENT| Identificador          |
| `nome`       | VARCHAR(100)    | NOT NULL          | Nome do produto        |
| `preco`      | DECIMAL(10,2)   | NOT NULL          | Preço unitário         |
| `estoque`    | INT             | DEFAULT 0         | Quantidade em estoque  |
| `criado_em`  | DATETIME        | AUTO              | Data de criação        |

Nome da tabela: **`produtos`**

---

## Passo 2 — Criar o arquivo da entidade

Crie um arquivo em:

```
src/models/entities/Produto.ts
```

**Convenção de nomes:**

| Item            | Padrão do projeto                          |
|-----------------|--------------------------------------------|
| Arquivo         | PascalCase → `Produto.ts`                  |
| Classe          | PascalCase → `Produto`                     |
| Tabela no banco | snake_case plural → `produtos`             |
| Propriedades    | camelCase → `criadoEm`                     |
| Colunas no banco| snake_case → `criado_em` (quando diferente)|

---

## Passo 3 — Escrever a classe com decorators

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity("produtos")
export class Produto {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  nome!: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  preco!: number;

  @Column({ type: "int", default: 0 })
  estoque!: number;

  @CreateDateColumn({ name: "criado_em" })
  criadoEm!: Date;
}
```

### Decorators mais usados

| Decorator                  | Função                                      | Equivalente SQL        |
|----------------------------|---------------------------------------------|------------------------|
| `@Entity("nome_tabela")`   | Marca a classe como tabela                  | `CREATE TABLE ...`     |
| `@PrimaryGeneratedColumn()`| Chave primária auto incremento              | `id INT PRIMARY KEY AUTO_INCREMENT` |
| `@Column({ ... })`         | Coluna comum                                | `nome VARCHAR(100)`    |
| `@CreateDateColumn()`      | Data de criação automática                  | `criado_em DATETIME`   |
| `@UpdateDateColumn()`      | Data de atualização automática              | `atualizado_em DATETIME` |
| `@Column({ unique: true })`| Valor único na coluna                       | `UNIQUE`               |
| `@Column({ nullable: true })`| Permite NULL                              | `NULL`                 |
| `@Column({ default: 0 })`  | Valor padrão                                | `DEFAULT 0`            |

---

## Passo 4 — Escolher o tipo SQL correto

Referência rápida para `@Column({ type: "..." })`:

| Dado no banco     | `type` TypeORM   | Exemplo                          |
|-------------------|------------------|----------------------------------|
| Texto curto       | `varchar`        | `{ type: "varchar", length: 100 }` |
| Texto longo       | `text`           | `{ type: "text" }`               |
| Número inteiro    | `int`            | `{ type: "int" }`                |
| Número decimal    | `decimal`        | `{ type: "decimal", precision: 10, scale: 2 }` |
| Verdadeiro/Falso  | `boolean`        | `{ type: "boolean", default: true }` |
| Data/hora         | `datetime`       | `{ type: "datetime" }`           |
| Data              | `date`           | `{ type: "date" }`               |

> Use `@CreateDateColumn` e `@UpdateDateColumn` em vez de `@Column` para campos de auditoria — o TypeORM preenche automaticamente.

---

## Passo 5 — Exportar no índice de entidades (opcional, recomendado)

Abra `src/models/index.ts` e adicione a exportação:

```typescript
export { Usuario } from "./entities/Usuario";
export { Produto } from "./entities/Produto";  // ← adicionar
```

Isso facilita importar a entidade em outros arquivos:

```typescript
import { Produto } from "../models";
```

> **Nota:** o TypeORM já descobre entidades automaticamente pela pasta `src/models/entities/` (configurado em `src/config/database.ts`). O `index.ts` serve apenas para organização.

---

## Passo 6 — Reiniciar a API e verificar a tabela

1. Reinicie o servidor:

```bash
npm run dev
```

2. Com `DB_LOGGING=true`, observe no terminal o SQL gerado. Você verá algo como:

```sql
CREATE TABLE `produtos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `estoque` int NOT NULL DEFAULT 0,
  `criado_em` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`)
)
```

3. Confirme no cliente do banco (MySQL Workbench, DBeaver, pgAdmin, etc.) que a tabela `produtos` foi criada.

---

## Passo 7 — (Opcional) Mapear relacionamentos entre tabelas

Quando uma tabela referencia outra (chave estrangeira), use os decorators de relacionamento.

### Exemplo: Produto pertence a uma Categoria

**Tabela `categorias`:**

```typescript
@Entity("categorias")
export class Categoria {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 80 })
  nome!: string;

  @OneToMany(() => Produto, (produto) => produto.categoria)
  produtos!: Produto[];
}
```

**Coluna FK em `produtos`:**

```typescript
import { ManyToOne, JoinColumn } from "typeorm";
import { Categoria } from "./Categoria";

@Entity("produtos")
export class Produto {
  // ... demais colunas ...

  @ManyToOne(() => Categoria, (categoria) => categoria.produtos)
  @JoinColumn({ name: "categoria_id" })
  categoria!: Categoria;

  @Column({ name: "categoria_id" })
  categoriaId!: number;
}
```

| Relacionamento | Decorator     | Lado da FK        |
|----------------|---------------|-------------------|
| 1:N            | `@OneToMany`  | lado "1" (sem FK) |
| N:1            | `@ManyToOne`  | lado "N" (com FK) |
| 1:1            | `@OneToOne`   | um dos lados      |
| N:N            | `@ManyToMany` | tabela intermediária |

---

## Checklist final

- [ ] Tabela definida no modelo conceitual (colunas, tipos, restrições)
- [ ] Arquivo criado em `src/models/entities/NomeEntidade.ts`
- [ ] Classe decorada com `@Entity("nome_da_tabela")`
- [ ] Chave primária com `@PrimaryGeneratedColumn()`
- [ ] Colunas com `@Column` e tipos corretos
- [ ] Exportação adicionada em `src/models/index.ts`
- [ ] API reiniciada e tabela verificada no banco
- [ ] SQL gerado conferido no terminal (`DB_LOGGING=true`)

---

## Referência: entidade de exemplo no projeto

Veja a entidade `Usuario` já implementada:

```
src/models/entities/Usuario.ts
```

Ela mapeia a tabela `usuarios` com colunas `id`, `nome`, `email`, `ativo`, `criado_em` e `atualizado_em`.

---

## Próximo passo

Depois de mapear a tabela, crie a API REST para expor os dados. Siga o guia:

**[Criar uma nova API](./criar-nova-api.md)**
