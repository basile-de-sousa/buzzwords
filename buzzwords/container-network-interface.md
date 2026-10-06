---
term: Container Network Interface
slug: container-network-interface
acronym: CNI
tags: [infrastructure, cloud]
relations:
  in: [Kubernetes]
  near: [CRI, CSI, eBPF]
  not: [Service Mesh]
created: 2026-10-06
updated: 2026-10-06
---
**Container Network Interface (CNI)**
- Conceptuellement : le **standard de plugin réseau** de Kubernetes, qui permet de brancher la solution réseau de son choix sur le cluster.
- Techniquement : le plugin attribue une **adresse IP à chaque pod**, assure la **connectivité entre pods** sur tous les nœuds et applique les **Network Policies**.
- Ex : Cilium (basé sur eBPF), Calico, Flannel.
