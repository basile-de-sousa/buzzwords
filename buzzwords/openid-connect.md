---
term: OpenID Connect
slug: openid-connect
acronym: OIDC
tags: [securite]
relations:
  in: [IAM]
  contains: [OAuth 2.0, JWT]
  near: [SAML, SSO]
  not: [OAuth 2.0 seul]
created: 2026-10-06
updated: 2026-10-06
---
**OpenID Connect (OIDC)**
- Conceptuellement : une **couche d'identité** posée sur OAuth 2.0, qui permet de savoir **qui est l'utilisateur** (authentification), alors qu'OAuth seul ne gère que l'**autorisation**.
- Techniquement : l'**Identity Provider** renvoie à l'application un **ID Token** (un JWT signé) qui contient l'identité de l'utilisateur.
- Sert à : faire du **SSO** et du « Se connecter avec Google » sur des apps web, mobiles et des API. C'est le standard moderne qui succède à SAML.
- Ex : Microsoft Entra ID, Okta, Keycloak.
