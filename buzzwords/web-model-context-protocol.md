---
term: Web Model Context Protocol
slug: web-model-context-protocol
acronym: WebMCP
tags: [ia, integration]
relations:
  near: [MCP, Agentic Browser, A2A]
  not: [Computer Use, Web Scraping]
created: 2026-09-27
updated: 2026-09-27
---
**Web Model Context Protocol (WebMCP)**
- Conceptuellement : le **MCP côté navigateur**. Un site web **expose ses fonctionnalités** comme des **outils** qu'un **agent IA** peut appeler directement.
- Techniquement : une **API JavaScript** (`navigator.modelContext`) où la page **déclare ses tools** (nom, description, schéma), qui s'exécutent **dans la session de l'utilisateur**, sans serveur MCP séparé.
- Sert à : remplacer le **scraping** et le **clic sur l'UI** par des **appels structurés**, ce qui rend l'agent plus fiable et plus rapide. Standard **émergent** (proposition W3C portée par Google et Microsoft, preview dans Chrome).
- Ex : Google Chrome (early preview), Microsoft Edge, MCP-B (polyfill open source).
