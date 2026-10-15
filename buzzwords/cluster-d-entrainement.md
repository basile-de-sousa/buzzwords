---
term: "Cluster d'entraînement"
slug: cluster-d-entrainement
aliases: [Training cluster]
tags: [infrastructure, ia]
relations:
  in: [AI Factory, HPC]
  near: ["Cluster d'inférence", InfiniBand]
  not: [Inférence]
created: 2026-10-15
updated: 2026-10-15
---
**Cluster d'entraînement (Training cluster)**
- Conceptuellement : un **supercalculateur dédié** à la création des modèles d'IA.
- Techniquement : des **dizaines de milliers de GPU** reliés par une **interconnexion très rapide**, car ils doivent synchroniser les poids en permanence. Un entraînement peut durer **des semaines**.
- Sert à : **entraîner** les modèles de fondation (LLM), une opération ponctuelle mais très coûteuse.
- Ex : xAI Colossus, Meta Research SuperCluster, Microsoft Azure (pour OpenAI).
