---
term: Agent2Agent Protocol
slug: agent2agent-protocol
acronym: A2A
tags: [ia, integration]
relations:
  near: [MCP, Multi-Agent System, WebMCP]
  not: [API Gateway]
created: 2026-09-27
updated: 2026-09-27
---
**Agent2Agent Protocol (A2A)**
- Conceptuellement : un **standard ouvert** pour que des **agents IA** de fournisseurs différents **communiquent et collaborent** entre eux (MCP relie un agent à ses outils, A2A relie **agent à agent**).
- Techniquement : chaque agent publie une **Agent Card** (ses compétences, son endpoint). Les échanges passent par **JSON-RPC sur HTTP**, avec gestion de **tâches** longues et de **streaming**.
- Sert à : l'**orchestration multi-agents** interopérable en entreprise. Protocole lancé par Google, désormais gouverné par la **Linux Foundation**.
- Ex : Google Agent Development Kit (ADK), Microsoft Azure AI Foundry, Salesforce Agentforce.
