---
term: Web Application Firewall
slug: web-application-firewall
acronym: WAF
tags: [securite]
relations:
  in: [WAAP]
  near: [Reverse Proxy, API Gateway, RASP]
  not: [Firewall réseau]
created: 2026-10-19
updated: 2026-10-23
---
**Web Application Firewall (WAF)**
- Conceptuellement : un **pare-feu applicatif** (couche 7) placé devant une application web.
- Techniquement : il **filtre les requêtes HTTP** à l'aide de **règles** et de signatures (OWASP Top 10 : injection SQL, XSS). Il permet aussi le **virtual patching** d'une faille en attendant le correctif.
- Ex : Cloudflare WAF, AWS WAF, F5 Advanced WAF.
