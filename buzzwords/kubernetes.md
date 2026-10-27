---
term: Kubernetes
slug: kubernetes
acronym: K8s
aliases: [K8s]
tags: [infrastructure, cloud, devops]
relations:
  in: [Cloud Native]
  contains: [Pod]
  near: [Docker Swarm, HashiCorp Nomad]
  same: [K8s]
  not: [Docker]
created: 2026-10-27
updated: 2026-10-27
---
**Kubernetes (K8s)**
- Conceptuellement : un **orchestrateur de conteneurs**, le « chef d'orchestre » qui fait tourner des applications conteneurisées sur un **cluster** de machines.
- Techniquement : on décrit l'**état désiré** (déclaratif, en YAML) et Kubernetes le maintient : **scheduling**, **auto-scaling**, **self-healing** (redémarre ce qui tombe), répartition de charge.
- Sert à : déployer des **microservices** de façon portable entre clouds et on-premise ; socle du **platform engineering**.
- Ex : Google Kubernetes Engine (GKE), Amazon EKS, Azure Kubernetes Service (AKS), Red Hat OpenShift.
