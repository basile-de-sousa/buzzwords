---
term: Apache Kafka
slug: apache-kafka
aliases: [Kafka, event streaming platform, bus d'événements]
tags: [integration, data]
relations:
  in: [EDA]
  contains: [Kafka Streams]
  near: [RabbitMQ, Apache Pulsar, ESB]
  not: [ETL, Message Queue classique]
created: 2026-09-28
updated: 2026-10-03
---
**Apache Kafka (event streaming platform, bus d'événements)**
- Conceptuellement : un **journal d'événements distribué** (log) où des **producteurs publient** et des **consommateurs s'abonnent** à des **topics**, de façon **découplée et asynchrone**.
- Techniquement : les messages sont **persistés et rejouables** (rétention), **partitionnés** pour la **scalabilité** et répliqués pour la **haute disponibilité**.
- Sert à : **architectures event-driven**, **streaming temps réel**, intégration entre microservices, alimentation data (CDC, data lake).
- Ex : Apache Kafka (open source), Confluent Cloud, Amazon MSK.
