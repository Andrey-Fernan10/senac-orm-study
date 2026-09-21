import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserGroup } from "./UserGroup";
import { GroupRole } from "./GroupRole";

/**
 * Tabela: groups
 * Grupos / times do sistema RBAC.
 */
@Entity("groups")
export class Group {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => UserGroup, (userGroup) => userGroup.group)
  userGroups!: UserGroup[];

  @OneToMany(() => GroupRole, (groupRole) => groupRole.group)
  groupRoles!: GroupRole[];
}
