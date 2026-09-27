---
term: Ubiquitous Language
slug: ubiquitous-language
acronym: UL
aliases: [langage omniprésent]
tags: [architecture, conception]
relations:
  in: [DDD]
  near: [Bounded Context, Event Storming, Domain Model]
  not: [Glossaire]
created: 2026-09-27
updated: 2026-09-27
---
**Ubiquitous Language (UL, ou langage omniprésent)**
- Conceptuellement : un **vocabulaire commun** partagé par les **experts métier** et les **développeurs**, pilier du **DDD**.
- Techniquement : les termes métier se retrouvent **tels quels dans le code** (classes, méthodes, événements), et chaque terme a un sens valable **dans un seul Bounded Context**.
- Sert à : **supprimer les traductions** entre métier et technique, et donc les malentendus (ex. « Pièce », « Fournisseur », « Empreinte carbone » ont le même nom dans les ateliers, les specs et le code).
- Ex : pratiques d'Event Storming, outils de glossaire et de modélisation comme Miro, Context Mapper.
