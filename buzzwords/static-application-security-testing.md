---
term: Static Application Security Testing
slug: static-application-security-testing
acronym: SAST
aliases: [white-box testing]
tags: [securite, devops]
relations:
  in: [AppSec, DevSecOps]
  near: [DAST, SCA]
  not: [linter]
created: 2026-10-19
updated: 2026-10-19
---
**Static Application Security Testing (SAST, ou « white-box testing »)**
- Conceptuellement : analyser le **code source** sans l'exécuter pour y trouver des failles.
- Techniquement : outil branché dans l'IDE ou la **CI/CD**, qui repère injections SQL, secrets en dur ou mauvais patterns **tôt dans le cycle** (shift-left) ; risque de **faux positifs**.
- Ex : SonarQube, Checkmarx One, Semgrep.
