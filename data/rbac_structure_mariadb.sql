-- Estrutura de Banco de Dados para um Sistema RBAC Robusto
-- (Role-Based Access Control)
-- Dialeto: MariaDB / MySQL

-- 1. Tabela de Usuários
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT UUID(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabela de Papéis (Roles)
-- Ex: 'Admin', 'Editor', 'Viewer', 'Manager'
CREATE TABLE roles (
    id CHAR(36) PRIMARY KEY DEFAULT UUID(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- Previne deleção acidental de papéis nativos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabela de Permissões (Permissions)
-- Ex: 'article:create', 'user:delete'
CREATE TABLE permissions (
    id CHAR(36) PRIMARY KEY DEFAULT UUID(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,     -- O módulo/tabela afetado (ex: 'article')
    action VARCHAR(50) NOT NULL,       -- Ação (ex: 'create', 'read', 'update', 'delete')
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Relacionamento: Usuários e Papéis (Muitos para Muitos)
CREATE TABLE user_roles (
    user_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    granted_by CHAR(36) NULL, -- Quem concedeu a role
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Relacionamento: Papéis e Permissões (Muitos para Muitos)
CREATE TABLE role_permissions (
    role_id CHAR(36) NOT NULL,
    permission_id CHAR(36) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ESTRUTURAS AVANÇADAS (OPCIONAIS)
-- ==========================================

-- 6. Tabela de Grupos / Times (Groups/Teams)
CREATE TABLE groups (
    id CHAR(36) PRIMARY KEY DEFAULT UUID(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Relacionamento: Usuários e Grupos
CREATE TABLE user_groups (
    user_id CHAR(36) NOT NULL,
    group_id CHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id),
    CONSTRAINT fk_ug_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ug_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Relacionamento: Grupos e Papéis
CREATE TABLE group_roles (
    group_id CHAR(36) NOT NULL,
    role_id CHAR(36) NOT NULL,
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, role_id),
    CONSTRAINT fk_gr_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_gr_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Auditoria (Audit Logs)
CREATE TABLE rbac_audit_logs (
    id CHAR(36) PRIMARY KEY DEFAULT UUID(),
    user_id CHAR(36) NULL, -- Quem fez a alteração
    action_type VARCHAR(50) NOT NULL, -- Ex: 'GRANT_ROLE', 'REVOKE_PERMISSION'
    target_user_id CHAR(36) NULL, -- Quem sofreu a alteração
    target_role_id CHAR(36) NULL,
    target_permission_id CHAR(36) NULL,
    ip_address VARCHAR(45), -- Suporta IPv4 e IPv6
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_al_tuser FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_al_trole FOREIGN KEY (target_role_id) REFERENCES roles(id) ON DELETE SET NULL,
    CONSTRAINT fk_al_tperm FOREIGN KEY (target_permission_id) REFERENCES permissions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- ÍNDICES (Performance)
-- ==========================================
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_user_groups_user_id ON user_groups(user_id);
