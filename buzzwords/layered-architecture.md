---
term: Layered Architecture
slug: layered-architecture
aliases: [architecture en couches, N-tier]
tags: [architecture, conception]
relations:
  near: [Hexagonal Architecture, Clean Architecture, Onion Architecture]
  same: [N-tier]
  not: [MVC]
created: 2026-09-27
updated: 2026-09-27
---
**Layered Architecture (architecture en couches, ou N-tier)**
- Conceptuellement : le code est découpé en **couches superposées**, chacune ne dépendant que de **celle du dessous**.
- Techniquement : en DDD, 4 couches classiques : **Présentation** (UI, API), **Application** (cas d'usage), **Domaine** (règles métier), **Infrastructure** (BDD, appels externes).
- Sert à : **séparer les responsabilités** et isoler le **métier** de la technique. Limite : le domaine dépend souvent de l'infrastructure, d'où son remplacement fréquent par l'architecture hexagonale.
- Ex : structure par défaut de Spring Boot (Controller / Service / Repository), ASP.NET Core, Django.
