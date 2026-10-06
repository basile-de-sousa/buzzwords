---
term: Single Sign-On
slug: single-sign-on
acronym: SSO
tags: [securite]
relations:
  in: [IAM]
  near: [OIDC, SAML, MFA, Fédération d'identité]
  not: [Gestionnaire de mots de passe]
created: 2026-10-06
updated: 2026-10-06
---
**Single Sign-On (SSO)**
- Conceptuellement : **une seule authentification** donne accès à **plusieurs applications**, sans avoir à se reconnecter sur chacune.
- Techniquement : un **Identity Provider (IdP)** central authentifie l'utilisateur, puis transmet son identité aux applications via un **protocole de fédération** comme OIDC ou SAML.
- Sert à : améliorer l'**expérience utilisateur**, centraliser le **contrôle des accès** et désactiver un compte partout en une seule fois.
- Ex : Microsoft Entra ID, Okta, Ping Identity.
