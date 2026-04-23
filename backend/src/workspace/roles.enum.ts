// roles.enum.ts — condiviso tra tutti i moduli
export enum WorkspaceRole {
  //OWNER = 'owner',           // non assegnabile via invito
  PROJECT_MANAGER = 'project manager',
  TECH_LEAD = 'tech lead',
  DEVELOPER = 'developer',
}

// Ruoli che possono essere assegnati tramite invito
// OWNER non è assegnabile — nasce solo con createWorkspace
/*export const ASSIGNABLE_ROLES = [
  WorkspaceRole.PROJECT_MANAGER,
  WorkspaceRole.TECH_LEAD,
  WorkspaceRole.DEVELOPER
] as const

export type AssignableRole = typeof ASSIGNABLE_ROLES[number]*/
