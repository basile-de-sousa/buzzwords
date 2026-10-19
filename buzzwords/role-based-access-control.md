---
term: Role-Based Access Control
slug: role-based-access-control
acronym: RBAC
tags: [securite]
relations:
  in: [IAM]
  near: [ABAC, ReBAC]
created: 2026-10-19
updated: 2026-10-19
---
**Role-Based Access Control (RBAC)**
- Conceptuellement : les droits sont portés par des **rôles**, et on attribue des rôles aux utilisateurs (Admin, Dev, Lecteur).
- Techniquement : simple et lisible, mais tend vers l'**explosion des rôles** quand les cas se multiplient.
- Ex : Kubernetes RBAC, rôles Microsoft Entra ID, AWS IAM.
