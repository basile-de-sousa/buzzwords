---
term: Web Application Firewall
slug: web-application-firewall
acronym: WAF
tags: [securite]
relations:
  in: [WAAP]
  near: [API Gateway]
  not: [pare-feu réseau]
created: 2026-10-19
updated: 2026-10-19
---
**Web Application Firewall (WAF)**
- Conceptuellement : un **pare-feu applicatif** placé devant une application web.
- Techniquement : filtre le **trafic HTTP** selon des règles (injections SQL, XSS, **Top 10 OWASP**) ; ne voit pas les failles du code lui-même.
- Ex : Cloudflare WAF, AWS WAF, F5 Advanced WAF.
