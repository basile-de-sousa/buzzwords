---
term: Attribute-Based Access Control
slug: attribute-based-access-control
acronym: ABAC
tags: [securite]
relations:
  in: [IAM]
  near: [RBAC, ReBAC, PBAC]
created: 2026-10-19
updated: 2026-10-19
---
**Attribute-Based Access Control (ABAC)**
- Conceptuellement : l'accès se décide à partir d'**attributs** (de l'utilisateur, de la ressource, du contexte : service, pays, heure).
- Techniquement : des **politiques** évaluées à chaque requête ; **très fin**, mais plus difficile à auditer.
- Ex : AWS IAM (conditions sur tags), Azure ABAC, Open Policy Agent.
