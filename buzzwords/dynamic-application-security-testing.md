---
term: Dynamic Application Security Testing
slug: dynamic-application-security-testing
acronym: DAST
aliases: [black-box testing]
tags: [securite, devops]
relations:
  in: [AppSec]
  near: [SAST, IAST]
  not: [pentest]
created: 2026-10-19
updated: 2026-10-19
---
**Dynamic Application Security Testing (DAST, ou « black-box testing »)**
- Conceptuellement : attaquer l'**application en fonctionnement** de l'extérieur, comme un attaquant, sans voir le code.
- Techniquement : envoie des **requêtes malveillantes** à l'appli déployée (recette, préprod) et observe ses réponses ; trouve les failles **de configuration et d'exécution**, mais ne pointe pas la ligne de code.
- Ex : ZAP, Burp Suite DAST, Invicti.
