import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Role } from "./Role";
import { Permission } from "./Permission";

/**
 * Tabela: rbac_audit_logs
 * Auditoria de alterações no sistema RBAC.
 */
@Entity("rbac_audit_logs")
export class RbacAuditLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid", name: "user_id", nullable: true })
  userId!: string | null;

  @Column({ type: "varchar", name: "action_type", length: 50 })
  actionType!: string;

  @Column({ type: "uuid", name: "target_user_id", nullable: true })
  targetUserId!: string | null;

  @Column({ type: "uuid", name: "target_role_id", nullable: true })
  targetRoleId!: string | null;

  @Column({ type: "uuid", name: "target_permission_id", nullable: true })
  targetPermissionId!: string | null;

  @Column({ type: "varchar", name: "ip_address", length: 45, nullable: true })
  ipAddress!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.auditLogs, {
    onDelete: "SET NULL",
    nullable: true,
  })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @ManyToOne(() => User, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "target_user_id" })
  targetUser!: User | null;

  @ManyToOne(() => Role, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "target_role_id" })
  targetRole!: Role | null;

  @ManyToOne(() => Permission, { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "target_permission_id" })
  targetPermission!: Permission | null;
}
