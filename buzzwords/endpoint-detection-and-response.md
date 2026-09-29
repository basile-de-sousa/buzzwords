---
term: Endpoint Detection and Response
slug: endpoint-detection-and-response
acronym: EDR
tags: [securite]
relations:
  in: [XDR]
  near: [EPP, SIEM, NDR]
  not: [Antivirus]
created: 2026-09-29
updated: 2026-09-29
---
**Endpoint Detection and Response (EDR)**
- Conceptuellement : la **sécurité des postes et serveurs** (endpoints) passe de la simple **prévention** à la **détection de comportements** suspects et à la **réponse** aux incidents.
- Techniquement : un **agent** installé sur chaque machine collecte en continu la **télémétrie** (processus, fichiers, réseau), l'analyse par **règles et IA**, et permet l'**isolement** de la machine ou le **kill** d'un processus à distance.
- Sert à : contrer les attaques que l'antivirus classique ne voit pas (**ransomware**, **fileless**, mouvements latéraux), et outiller le **SOC** pour l'investigation.
- Ex : CrowdStrike Falcon Insight, Microsoft Defender for Endpoint, SentinelOne Singularity.
