import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Role } from "./Role";
import { Permission } from "./Permission";

/**
 * Tabela: role_permissions
 * Relacionamento N:N entre papéis e permissões.
 */
@Entity("role_permissions")
@Index("idx_role_permissions_role_id", ["roleId"])
export class RolePermission {
  @PrimaryColumn({ type: "uuid", name: "role_id" })
  roleId!: string;

  @PrimaryColumn({ type: "uuid", name: "permission_id" })
  permissionId!: string;

  @CreateDateColumn({ name: "granted_at" })
  grantedAt!: Date;

  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "permission_id" })
  permission!: Permission;
}
