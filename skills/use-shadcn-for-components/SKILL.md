---
name: use-shadcn-for-components
description: Use this whenever creating, building, or scaffolding a new UI component, form, dialog, dashboard widget, or page section. Ensures shadcn/ui components are used instead of building from scratch, and queries the shadcn MCP when unsure how to implement or install something.
---

# Use shadcn for Components

## When to use this skill
Whenever the user asks to build a UI component (button, form, dialog, table, card, dashboard section, etc.) — follow this skill instead of writing it from scratch.

## Instructions
1. **Default rule**: Whenever a new component is needed, first check whether a matching component/block already exists in the shadcn/ui registry (Button, Dialog, Form, Table, Card, DropdownMenu, Sheet, etc.). Don't use custom-built HTML/CSS if a shadcn component already covers it.
2. **When to call the shadcn MCP**:
   - When unsure how to use a component's name/props/API
   - When unsure which components/blocks exist in the registry
   - When unsure of the exact install command
   - When you want to change an existing component's variant/style but aren't sure of the correct props

   ➜ Use the configured shadcn MCP tools to query (list components, search components, get install command) — don't guess from memory.
3. **Installation**: Once you get the install command from the MCP, run it via the shadcn CLI (`npx shadcn@latest add <component>`) — don't manually copy-paste.
4. **Fallback**: Only if the shadcn registry doesn't have the pattern you need, build a custom component on top of shadcn's existing primitives (Radix-based) — never write it fully from scratch.
5. Style components to stay consistent with the project's existing design tokens (dark mode, Tabler icons, Inter typeface).

## Example
**User**: "Build a form for vehicle assignment"
**Agent flow**:
1. Query the shadcn MCP → check whether Form, Select, DatePicker components exist
2. Call `get_install_command` to get the install command
3. Run the CLI to install the components
4. Build the form logic with react-hook-form + zod (shadcn convention)