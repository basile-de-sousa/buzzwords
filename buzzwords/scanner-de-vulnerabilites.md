---
term: Scanner de vulnérabilités
slug: scanner-de-vulnerabilites
aliases: [CVE checker, SCA scanner]
tags: [securite, devops]
relations:
  in: [DevSecOps]
  near: [Dependabot, SBOM]
  same: [SCA scanner]
  not: [SAST, Pentest]
created: 2026-10-23
updated: 2026-10-23
---
**Scanner de vulnérabilités (CVE checker, ou SCA scanner)**
- Conceptuellement : un outil qui **inventorie les composants** et les **confronte aux bases CVE**.
- Techniquement : il scanne le **code, les dépendances, les images de conteneurs et l'IaC**, s'**intègre à la CI/CD** et bloque une livraison au-delà d'un seuil CVSS.
- Ex : Trivy, Snyk, OWASP Dependency-Check.
