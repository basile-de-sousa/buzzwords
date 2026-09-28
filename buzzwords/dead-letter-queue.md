---
term: Dead Letter Queue
slug: dead-letter-queue
acronym: DLQ
tags: [integration]
relations:
  in: [Message Queue, Event-Driven Architecture]
  near: [Retry Policy, Poison Message]
  not: [Backup]
created: 2026-09-28
updated: 2026-09-28
---
**Dead Letter Queue (DLQ)**
- Conceptuellement : une **file de quarantaine** où sont mis de côté les messages qu'on **n'arrive pas à traiter**, pour éviter qu'ils ne bloquent le flux principal.
- Techniquement : un message y est déplacé après un **nombre maximal de tentatives**, une expiration (TTL) ou une erreur de format. On peut ensuite l'**analyser**, le **corriger** puis le **rejouer**.
- Sert à : garantir la **résilience** et la **traçabilité** d'une intégration asynchrone, sans perdre de message.
- Ex : Amazon SQS (redrive policy), Azure Service Bus, RabbitMQ (dead letter exchange).
