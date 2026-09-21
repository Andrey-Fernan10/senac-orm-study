import {
  Entity,
  PrimaryColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Group } from "./Group";

/**
 * Tabela: user_groups
 * Relacionamento N:N entre usuários e grupos.
 */
@Entity("user_groups")
@Index("idx_user_groups_user_id", ["userId"])
export class UserGroup {
  @PrimaryColumn({ type: "uuid", name: "user_id" })
  userId!: string;

  @PrimaryColumn({ type: "uuid", name: "group_id" })
  groupId!: string;

  @CreateDateColumn({ name: "joined_at" })
  joinedAt!: Date;

  @ManyToOne(() => User, (user) => user.userGroups, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Group, (group) => group.userGroups, { onDelete: "CASCADE" })
  @JoinColumn({ name: "group_id" })
  group!: Group;
}
