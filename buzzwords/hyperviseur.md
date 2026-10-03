---
term: Hyperviseur
slug: hyperviseur
acronym: VMM
aliases: [Virtual Machine Monitor]
tags: [infrastructure, cloud]
relations:
  in: [Virtualisation]
  contains: [VM]
  near: [Conteneur, IaaS]
  same: [VMM]
  not: [Conteneur]
created: 2026-10-03
updated: 2026-10-03
---
**Hyperviseur (VMM, Virtual Machine Monitor)**
- Conceptuellement : une couche logicielle qui **découpe un serveur physique** en plusieurs **machines virtuelles (VM)** isolées, chacune avec son propre OS.
- Techniquement : il **alloue et partage** les ressources matérielles (CPU, RAM, disque, réseau) entre les VM. **Type 1** (bare metal, directement sur le matériel, en datacenter) ou **Type 2** (hébergé sur un OS, sur un poste de travail).
- Ex : VMware ESXi, Microsoft Hyper-V, KVM.
