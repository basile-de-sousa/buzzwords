---
term: Hexagonal Architecture
slug: hexagonal-architecture
aliases: [Ports & Adapters]
tags: [architecture, conception]
relations:
  near: [Clean Architecture, Onion Architecture, Layered Architecture, DDD]
  same: [Ports & Adapters]
  not: [Microservices]
created: 2026-09-27
updated: 2026-09-27
---
**Hexagonal Architecture (ou Ports & Adapters)**
- Conceptuellement : le **domaine métier** est au **centre**, et tout ce qui est technique (UI, BDD, API externes) gravite **autour**, sans que le centre en dépende.
- Techniquement : le domaine expose des **ports** (interfaces), et l'extérieur les implémente via des **adapters** (ex. un port `TauxDeChange` branché sur une API de devises ou sur un mock). Les dépendances **pointent vers le centre**.
- Sert à : **tester le métier** sans BDD ni réseau, et **changer de technologie** sans toucher aux règles métier.
- Ex : frameworks qui l'outillent bien, comme Spring Boot avec Spring Modulith, NestJS, et le guide jMolecules pour Java.
