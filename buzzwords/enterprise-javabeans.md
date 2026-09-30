---
term: Enterprise JavaBeans
slug: enterprise-javabeans
acronym: EJB
aliases: [Jakarta Enterprise Beans]
tags: [architecture]
relations:
  in: [Jakarta EE (ex-Java EE)]
  near: [Spring, CORBA]
  same: [Jakarta Enterprise Beans]
  not: [JavaBeans]
created: 2026-09-30
updated: 2026-09-30
---
**Enterprise JavaBeans (EJB, aujourd'hui Jakarta Enterprise Beans)**
- Conceptuellement : un modèle de **composants métier côté serveur** en Java, où le serveur d'application gère la plomberie à la place du développeur.
- Techniquement : des classes Java déployées dans un **conteneur EJB** qui fournit **transactions**, **sécurité**, cycle de vie et **appels distants**. On distingue les Session Beans (stateless/stateful) et les Message-Driven Beans.
- Legacy : en **déclin**, largement remplacé par **Spring Boot** et les microservices. On le trouve surtout dans les SI bancaires et publics existants.
- Ex : WildFly (Red Hat JBoss EAP), Oracle WebLogic Server, IBM WebSphere Liberty.
