---
term: Infrastructure as Code
slug: infrastructure-as-code
acronym: IaC
tags: [devops, infrastructure]
relations:
  in: [DevOps]
  near: [GitOps, Configuration Management]
  not: [script shell]
created: 2026-10-19
updated: 2026-10-19
---
**Infrastructure as Code (IaC)**
- Conceptuellement : décrire l'**infrastructure dans du code** versionné, testable et exécutable, au lieu de la configurer à la main.
- Techniquement : approche **déclarative** (on décrit l'état voulu) et **idempotente** ; l'outil calcule l'écart et l'applique, ce qui évite la **dérive de configuration**.
- Ex : Terraform, OpenTofu, Pulumi.
