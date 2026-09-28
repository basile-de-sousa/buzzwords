---
term: Polling
slug: polling
aliases: [Short Polling]
tags: [integration]
relations:
  near: [Long Polling, Webhook, WebSocket, Server-Sent Events]
  not: [Push, Pub/Sub]
created: 2026-09-28
updated: 2026-09-28
---
**Polling (ou Short Polling)**
- Conceptuellement : le client **interroge périodiquement** le serveur pour savoir s'il y a du nouveau, au lieu d'être **notifié**.
- Techniquement : des **requêtes répétées** à intervalle fixe (ex. toutes les 5 s), souvent **vides**, donc coûteuses en **charge et latence**.
- Sert à : récupérer un statut ou des données quand le serveur ne peut pas **pousser** (jobs asynchrones, API tierces, legacy).
- Ex : Kafka Consumer (poll), Amazon SQS (long polling), Salesforce Change Data Capture en mode pull.
