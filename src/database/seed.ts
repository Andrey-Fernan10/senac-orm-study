import "reflect-metadata";
import { connectDatabase, AppDataSource } from "../config/database";
import { User } from "../models/entities/User";
import { Role } from "../models/entities/Role";
import { Permission } from "../models/entities/Permission";
import { UserRole } from "../models/entities/UserRole";
import { RolePermission } from "../models/entities/RolePermission";
import { Group } from "../models/entities/Group";
import { UserGroup } from "../models/entities/UserGroup";
import { GroupRole } from "../models/entities/GroupRole";
import { RbacAuditLog } from "../models/entities/RbacAuditLog";

/**
 * Seed — dados iniciais para a disciplina (RBAC).
 *
 * Uso:
 *   npm run seed
 *
 * Idempotente: se o usuário admin já existir, o seed é interrompido
 * (não duplica dados). Para forçar recriação, limpe as tabelas antes.
 */

const PERMISSIONS = [
  { name: "user:create", resource: "user", action: "create", description: "Criar usuários" },
  { name: "user:read", resource: "user", action: "read", description: "Listar e visualizar usuários" },
  { name: "user:update", resource: "user", action: "update", description: "Atualizar usuários" },
  { name: "user:delete", resource: "user", action: "delete", description: "Remover usuários" },
  { name: "role:create", resource: "role", action: "create", description: "Criar papéis" },
  { name: "role:read", resource: "role", action: "read", description: "Visualizar papéis" },
  { name: "role:update", resource: "role", action: "update", description: "Atualizar papéis" },
  { name: "role:delete", resource: "role", action: "delete", description: "Remover papéis" },
  { name: "permission:read", resource: "permission", action: "read", description: "Visualizar permissões" },
  { name: "permission:assign", resource: "permission", action: "assign", description: "Atribuir permissões a papéis" },
  { name: "group:create", resource: "group", action: "create", description: "Criar grupos" },
  { name: "group:read", resource: "group", action: "read", description: "Visualizar grupos" },
  { name: "group:update", resource: "group", action: "update", description: "Atualizar grupos" },
  { name: "group:delete", resource: "group", action: "delete", description: "Remover grupos" },
  { name: "article:create", resource: "article", action: "create", description: "Criar artigos" },
  { name: "article:read", resource: "article", action: "read", description: "Ler artigos" },
  { name: "article:update", resource: "article", action: "update", description: "Editar artigos" },
  { name: "article:delete", resource: "article", action: "delete", description: "Excluir artigos" },
  { name: "audit:read", resource: "audit", action: "read", description: "Consultar logs de auditoria" },
];

const ROLES = [
  {
    name: "Admin",
    description: "Acesso total ao sistema",
    isSystem: true,
    permissions: PERMISSIONS.map((p) => p.name),
  },
  {
    name: "Manager",
    description: "Gerencia usuários, grupos e papéis",
    isSystem: true,
    permissions: [
      "user:create",
      "user:read",
      "user:update",
      "role:read",
      "permission:read",
      "permission:assign",
      "group:create",
      "group:read",
      "group:update",
      "article:read",
      "audit:read",
    ],
  },
  {
    name: "Editor",
    description: "Cria e edita conteúdo",
    isSystem: false,
    permissions: [
      "user:read",
      "group:read",
      "article:create",
      "article:read",
      "article:update",
    ],
  },
  {
    name: "Moderator",
    description: "Modera conteúdo e visualiza usuários",
    isSystem: false,
    permissions: [
      "user:read",
      "article:read",
      "article:update",
      "article:delete",
      "audit:read",
    ],
  },
  {
    name: "Viewer",
    description: "Apenas leitura",
    isSystem: true,
    permissions: ["user:read", "group:read", "article:read", "role:read"],
  },
];

const USERS = [
  {
    username: "admin",
    email: "admin@senac.local",
    passwordHash: "hash_admin_123",
    roles: ["Admin"],
  },
  {
    username: "maria.gestora",
    email: "maria@senac.local",
    passwordHash: "hash_maria_123",
    roles: ["Manager"],
  },
  {
    username: "joao.editor",
    email: "joao@senac.local",
    passwordHash: "hash_joao_123",
    roles: ["Editor"],
  },
  {
    username: "ana.moderadora",
    email: "ana@senac.local",
    passwordHash: "hash_ana_123",
    roles: ["Moderator"],
  },
  {
    username: "pedro.viewer",
    email: "pedro@senac.local",
    passwordHash: "hash_pedro_123",
    roles: ["Viewer"],
  },
  {
    username: "carla.editora",
    email: "carla@senac.local",
    passwordHash: "hash_carla_123",
    roles: ["Editor", "Viewer"],
  },
];

const GROUPS = [
  {
    name: "Tecnologia",
    description: "Equipe de TI e desenvolvimento",
    roles: ["Admin", "Editor"],
    users: ["admin", "joao.editor", "carla.editora"],
  },
  {
    name: "Conteudo",
    description: "Produção e moderação de conteúdo",
    roles: ["Editor", "Moderator"],
    users: ["joao.editor", "ana.moderadora", "carla.editora"],
  },
  {
    name: "Gestao",
    description: "Gestão administrativa",
    roles: ["Manager"],
    users: ["admin", "maria.gestora"],
  },
];

async function seed() {
  await connectDatabase();

  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);
  const permissionRepo = AppDataSource.getRepository(Permission);
  const userRoleRepo = AppDataSource.getRepository(UserRole);
  const rolePermissionRepo = AppDataSource.getRepository(RolePermission);
  const groupRepo = AppDataSource.getRepository(Group);
  const userGroupRepo = AppDataSource.getRepository(UserGroup);
  const groupRoleRepo = AppDataSource.getRepository(GroupRole);
  const auditRepo = AppDataSource.getRepository(RbacAuditLog);

  const adminExists = await userRepo.findOneBy({ username: "admin" });
  if (adminExists) {
    console.log("[Seed] Dados já existem (usuário admin encontrado). Nada a fazer.");
    console.log("[Seed] Para recriar, limpe as tabelas e execute novamente.");
    await AppDataSource.destroy();
    return;
  }

  console.log("[Seed] Inserindo permissões...");
  const permissionMap = new Map<string, Permission>();
  for (const data of PERMISSIONS) {
    const permission = permissionRepo.create(data);
    const saved = await permissionRepo.save(permission);
    permissionMap.set(saved.name, saved);
  }

  console.log("[Seed] Inserindo papéis (roles)...");
  const roleMap = new Map<string, Role>();
  for (const data of ROLES) {
    const role = roleRepo.create({
      name: data.name,
      description: data.description,
      isSystem: data.isSystem,
    });
    const saved = await roleRepo.save(role);
    roleMap.set(saved.name, saved);

    for (const permName of data.permissions) {
      const permission = permissionMap.get(permName);
      if (!permission) continue;

      await rolePermissionRepo.save(
        rolePermissionRepo.create({
          roleId: saved.id,
          permissionId: permission.id,
        })
      );
    }
  }

  console.log("[Seed] Inserindo usuários...");
  const userMap = new Map<string, User>();
  for (const data of USERS) {
    const user = userRepo.create({
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      isActive: true,
    });
    const saved = await userRepo.save(user);
    userMap.set(saved.username, saved);

    for (const roleName of data.roles) {
      const role = roleMap.get(roleName);
      if (!role) continue;

      await userRoleRepo.save(
        userRoleRepo.create({
          userId: saved.id,
          roleId: role.id,
          grantedBy: userMap.get("admin")?.id ?? saved.id,
        })
      );
    }
  }

  // Reatribui grantedBy do admin (ele ainda não existia no loop acima para si mesmo)
  const admin = userMap.get("admin")!;
  const adminRoles = await userRoleRepo.findBy({ userId: admin.id });
  for (const ur of adminRoles) {
    ur.grantedBy = admin.id;
    await userRoleRepo.save(ur);
  }

  console.log("[Seed] Inserindo grupos...");
  for (const data of GROUPS) {
    const group = await groupRepo.save(
      groupRepo.create({
        name: data.name,
        description: data.description,
      })
    );

    for (const roleName of data.roles) {
      const role = roleMap.get(roleName);
      if (!role) continue;
      await groupRoleRepo.save(
        groupRoleRepo.create({ groupId: group.id, roleId: role.id })
      );
    }

    for (const username of data.users) {
      const user = userMap.get(username);
      if (!user) continue;
      await userGroupRepo.save(
        userGroupRepo.create({ userId: user.id, groupId: group.id })
      );
    }
  }

  console.log("[Seed] Inserindo logs de auditoria de exemplo...");
  await auditRepo.save([
    auditRepo.create({
      userId: admin.id,
      actionType: "GRANT_ROLE",
      targetUserId: userMap.get("maria.gestora")!.id,
      targetRoleId: roleMap.get("Manager")!.id,
      ipAddress: "127.0.0.1",
    }),
    auditRepo.create({
      userId: admin.id,
      actionType: "GRANT_PERMISSION",
      targetRoleId: roleMap.get("Editor")!.id,
      targetPermissionId: permissionMap.get("article:create")!.id,
      ipAddress: "127.0.0.1",
    }),
    auditRepo.create({
      userId: userMap.get("maria.gestora")!.id,
      actionType: "GRANT_ROLE",
      targetUserId: userMap.get("joao.editor")!.id,
      targetRoleId: roleMap.get("Editor")!.id,
      ipAddress: "10.0.0.15",
    }),
  ]);

  console.log("\n[Seed] Concluído com sucesso!");
  console.log(`  Permissões : ${PERMISSIONS.length}`);
  console.log(`  Papéis     : ${ROLES.length}`);
  console.log(`  Usuários   : ${USERS.length}`);
  console.log(`  Grupos     : ${GROUPS.length}`);
  console.log("\nUsuários criados:");
  for (const u of USERS) {
    console.log(`  - ${u.username} <${u.email}> → [${u.roles.join(", ")}]`);
  }

  await AppDataSource.destroy();
}

seed().catch(async (error) => {
  console.error("[Seed] Falha:", error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
