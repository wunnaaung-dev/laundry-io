## Role Level Creation Logic

- Only the super admin of a hotel or factory can create role levels and users.
- To create a role level (RBAC), the super admin must configure, for each resource (see [modules.md](./modules.md)), the level of access granted to that resource.
- To create a new user, the admin attaches an existing role level along with the user's login information.
- If no role level exists yet, the user must be told to create a role level first before a user can be created.