import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Role } from "./Role";

/**
 * Tabela: user_roles
 * Relacionamento N:N entre usuários e papéis.
 */
@Entity("user_roles")
@Index("idx_user_roles_user_id", ["userId"])
export class UserRole {
  @PrimaryColumn({ type: "uuid", name: "user_id" })
  userId!: string;

  @PrimaryColumn({ type: "uuid", name: "role_id" })
  roleId!: string;

  @CreateDateColumn({ name: "granted_at" })
  grantedAt!: Date;

  @Column({ type: "uuid", name: "granted_by", nullable: true })
  grantedBy!: string | null;

  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: "CASCADE" })
  @JoinColumn({ name: "role_id" })
  role!: Role;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "granted_by" })
  grantedByUser!: User | null;
}
