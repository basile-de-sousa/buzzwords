---
term: Interactive Application Security Testing
slug: interactive-application-security-testing
acronym: IAST
aliases: [grey-box testing]
tags: [securite, devops]
relations:
  in: [AppSec]
  near: [SAST, DAST, RASP]
created: 2026-10-19
updated: 2026-10-19
---
**Interactive Application Security Testing (IAST, ou « grey-box testing »)**
- Conceptuellement : un **hybride SAST + DAST**, qui observe l'application **de l'intérieur** pendant qu'elle tourne.
- Techniquement : un **agent** installé dans le runtime suit les données pendant les tests fonctionnels et relie chaque faille à **la ligne de code** ; peu de faux positifs, mais dépend de la **couverture des tests**.
- Ex : Contrast Assess, Black Duck Seeker, HCL AppScan.
