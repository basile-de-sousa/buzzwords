---
term: Model Context Protocol
slug: model-context-protocol
acronym: MCP
tags: [ia, integration]
relations:
  contains: [MCP Server, MCP Client]
  near: [API, Function Calling]
  not: [API Gateway]
created: 2026-09-27
updated: 2026-10-09
---
**Model Context Protocol (MCP)**
- Conceptuellement : un **standard ouvert** qui relie un modèle d'IA à des **outils** et des **données** externes, comme une « prise universelle ».
- Techniquement : un protocole **client-serveur** en **JSON-RPC** (local en stdio ou distant en HTTP). Le **serveur** expose des tools, resources et prompts ; le **host**, avec son LLM, décide quoi appeler.
- Sert à : brancher un service une seule fois pour **tous les assistants IA**, au lieu d'une intégration par assistant.
- Ex : serveurs MCP de Notion, GitHub et Atlassian ; hosts comme Claude, ChatGPT ou Cursor.
