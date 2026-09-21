import { Router } from "express";
import userRoutes from "./user.routes";
import roleRoutes from "./role.routes";
import permissionRoutes from "./permission.routes";
import groupRoutes from "./group.routes";
import userRoleRoutes from "./user-role.routes";
import rolePermissionRoutes from "./role-permission.routes";
import userGroupRoutes from "./user-group.routes";
import groupRoleRoutes from "./group-role.routes";
import auditLogRoutes from "./audit-log.routes";

const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      message: "API senac-orm em execução",
    },
  });
});

routes.use("/users", userRoutes);
routes.use("/roles", roleRoutes);
routes.use("/permissions", permissionRoutes);
routes.use("/groups", groupRoutes);
routes.use("/user-roles", userRoleRoutes);
routes.use("/role-permissions", rolePermissionRoutes);
routes.use("/user-groups", userGroupRoutes);
routes.use("/group-roles", groupRoleRoutes);
routes.use("/audit-logs", auditLogRoutes);

export default routes;
