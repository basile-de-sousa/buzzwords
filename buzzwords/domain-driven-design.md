---
term: Domain-Driven Design
slug: domain-driven-design
acronym: DDD
tags: [architecture, conception]
relations:
  near: [Microservices, Event Storming, Clean Architecture, CQRS]
  not: [Data Domain (Data Mesh)]
created: 2026-09-27
updated: 2026-09-27
---
**Domain-Driven Design (DDD)**
- Conceptuellement : concevoir le logiciel autour du **métier**, avec les experts métier et un **langage ubiquitaire** partagé.
- Stratégiquement : découper le SI en **Bounded Contexts** (un modèle cohérent par domaine), reliés par une **context map**.
- Tactiquement : modéliser avec des **Entities**, **Value Objects**, **Aggregates** et **Domain Events**.
- Sert à : aligner **architecture et organisation**, et servir de base au découpage en **microservices**.
