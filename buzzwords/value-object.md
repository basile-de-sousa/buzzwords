---
term: Value Object
slug: value-object
acronym: VO
aliases: [objet-valeur]
tags: [architecture, conception]
relations:
  in: [DDD]
  near: [Entity, Aggregate]
  not: [DTO, Primitive Obsession]
created: 2026-09-27
updated: 2026-09-27
---
**Value Object (VO, ou objet-valeur)**
- Conceptuellement : un objet défini **uniquement par ses valeurs**, **sans identité** propre : deux VO aux mêmes valeurs sont **interchangeables**.
- Techniquement : **immuable**, comparé par **égalité de valeurs**, et porteur de ses **règles de validation** (ex. un Montant refuse une devise inconnue).
- Sert à : modéliser des notions comme **Montant + Devise**, **Distance**, **Quantité de CO₂**, plutôt que des types primitifs nus.
- Ex : `record` Java, `@dataclass(frozen=True)` Python, `Money` de la librairie Joda-Money.
