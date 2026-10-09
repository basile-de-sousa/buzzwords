---
term: Connecteur IA
slug: connecteur-ia
aliases: [Connector]
tags: [ia, integration]
relations:
  in: [MCP]
  near: [Plugin, Intégration]
  not: [Connecteur ETL]
created: 2026-10-09
updated: 2026-10-09
---
**Connecteur IA (Connector)**
- Conceptuellement : le **branchement**, vu par l'utilisateur, entre un assistant IA et une application (« j'ai connecté Notion à Claude »).
- Techniquement : un **serveur MCP** distant, plus un **client MCP** côté host, plus un **token OAuth** d'autorisation.
- Ex : connecteurs Google Drive, Gmail et Slack dans Claude ; connecteurs ChatGPT.
