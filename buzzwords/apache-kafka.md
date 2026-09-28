---
term: Apache Kafka
slug: apache-kafka
aliases: [Kafka]
tags: [integration, data]
relations:
  in: [Event-Driven Architecture]
  near: [Pub/Sub, RabbitMQ, Apache Pulsar, CDC]
  not: [ESB, Message Queue classique]
created: 2026-09-28
updated: 2026-09-28
---
**Apache Kafka**
- Conceptuellement : une plateforme d'**event streaming**, c'est-à-dire un **journal distribué** d'événements dans lequel les producteurs écrivent et où les consommateurs lisent à leur rythme.
- Techniquement : des **topics** découpés en **partitions** répliquées. Les messages sont **persistés** et **rejouables**, et les consommateurs viennent les chercher en **pull** (poll).
- Sert à : **découpler** les applications, faire de l'**intégration temps réel**, du **CDC** et du **traitement de flux** à très grand volume.
- Ex : Confluent Cloud, Amazon MSK, Redpanda.
