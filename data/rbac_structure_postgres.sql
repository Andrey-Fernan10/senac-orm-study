-- Estrutura de Banco de Dados para um Sistema RBAC Robusto
-- (Role-Based Access Control)
-- Dialeto: PostgreSQL (mas facilmente adaptável para MySQL/SQL Server)

-- 1. Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Papéis (Roles)
-- Ex: 'Admin', 'Editor', 'Viewer', 'Manager'
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE, -- Previne deleção acidental de papéis nativos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Permissões (Permissions)
-- Ex: 'article:create', 'user:delete'
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    resource VARCHAR(50) NOT NULL,     -- O módulo/tabela afetado (ex: 'article')
    action VARCHAR(50) NOT NULL,       -- Ação (ex: 'create', 'read', 'update', 'delete')
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Relacionamento: Usuários e Papéis (Muitos para Muitos)
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Quem concedeu a role
    PRIMARY KEY (user_id, role_id)
);

-- 5. Relacionamento: Papéis e Permissões (Muitos para Muitos)
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id)
);

-- ==========================================
-- ESTRUTURAS AVANÇADAS (OPCIONAIS, MAS RECOMENDADAS PARA SISTEMAS ROBUSTOS)
-- ==========================================

-- 6. Tabela de Grupos / Times (Groups/Teams)
-- Facilita gerenciar múltiplos usuários de um mesmo departamento
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Relacionamento: Usuários e Grupos
CREATE TABLE user_groups (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id)
);

-- 8. Relacionamento: Grupos e Papéis
-- Todos os usuários de um grupo herdam estes papéis
CREATE TABLE group_roles (
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (group_id, role_id)
);

-- 9. Auditoria (Audit Logs)
-- Essencial para segurança e conformidade
CREATE TABLE rbac_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Quem fez a alteração
    action_type VARCHAR(50) NOT NULL, -- Ex: 'GRANT_ROLE', 'REVOKE_PERMISSION'
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Quem sofreu a alteração
    target_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    target_permission_id UUID REFERENCES permissions(id) ON DELETE SET NULL,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ÍNDICES (Para performance em verificações de acesso contínuas)
-- ==========================================
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_user_groups_user_id ON user_groups(user_id);
