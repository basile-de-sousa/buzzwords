---
term: Model Context Protocol
slug: model-context-protocol
acronym: MCP
tags: [ia, integration]
relations:
  contains: [WebMCP]
  near: [A2A, Function Calling]
  not: [API REST]
created: 2026-09-27
updated: 2026-09-27
---
**Model Context Protocol (MCP)**
- Conceptuellement : un **standard ouvert** qui connecte un **agent IA** à des **outils et données** externes, comme un « **port USB-C** » universel pour l'IA.
- Techniquement : architecture **client-serveur** (**JSON-RPC**). Un **serveur MCP** expose des **tools**, des **resources** et des **prompts**, et l'application IA (le client) les découvre et les appelle.
- Sert à : éviter de coder une **intégration spécifique** par outil et par modèle. Lancé par Anthropic, confié ensuite à la **Linux Foundation**, et adopté par l'ensemble du marché.
- Ex : Claude, ChatGPT, GitHub MCP Server.
