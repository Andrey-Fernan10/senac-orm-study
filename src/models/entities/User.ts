import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { UserRole } from "./UserRole";
import { UserGroup } from "./UserGroup";
import { RbacAuditLog } from "./RbacAuditLog";

/**
 * Tabela: users
 * Usuários do sistema RBAC.
 */
@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 50, unique: true })
  username!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email!: string;

  @Column({ type: "varchar", name: "password_hash", length: 255 })
  passwordHash!: string;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive!: boolean;

  @Column({ type: "timestamp", name: "last_login", nullable: true })
  lastLogin!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles!: UserRole[];

  @OneToMany(() => UserGroup, (userGroup) => userGroup.user)
  userGroups!: UserGroup[];

  @OneToMany(() => RbacAuditLog, (log) => log.user)
  auditLogs!: RbacAuditLog[];
}