---
term: Business Impact Analysis
slug: business-impact-analysis
acronym: BIA
aliases: [Analyse d'impact métier]
tags: [securite, gouvernance]
relations:
  in: [Business Continuity Management, ISO 22301]
  near: [PCA, PRA, RTO / RPO]
  not: [Analyse de risques, BI]
created: 2026-10-05
updated: 2026-10-05
---
**Business Impact Analysis (BIA, ou analyse d'impact métier)**
- Conceptuellement : identifier les **activités critiques** et mesurer ce que coûte leur **interruption** dans le temps (financier, juridique, image).
- Techniquement : pour chaque processus, on fixe le **RTO** (durée d'arrêt tolérable, DMIA en français) et le **RPO** (perte de données tolérable, PDMA), qui dimensionnent ensuite les solutions de secours.
- Sert à : fonder le **PCA / PRA** sur des **priorités métier** plutôt que sur des choix techniques.
- Ex : ServiceNow Business Continuity Management, Fusion Framework System, Archer.
- Attention : la BIA mesure l'**impact**, pas la **probabilité** (≠ analyse de risques type EBIOS).
