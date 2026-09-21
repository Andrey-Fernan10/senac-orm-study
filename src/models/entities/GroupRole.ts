import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Group } from "./Group";
import { Role } from "./Role";

/**
 * Tabela: group_roles
 * Relacionamento N:N entre grupos e papéis.
 * Usuários do grupo herdam estes papéis.
 */
@Entity("group_roles")
export class GroupRole {
  @PrimaryColumn({ type: "uuid", name: "group_id" })
  groupId!: string; 

  @PrimaryColumn({ type: "uuid", name: "role_id" })
  roleId!: string;

  @CreateDateColumn({ name: "granted_at" })
  grantedAt!: Date;

  @ManyToOne(() => Group, (group) => group.groupRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "group_id" })
  group!: Group;

  @ManyToOne(() => Role, (role) => role.groupRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Role;
}
