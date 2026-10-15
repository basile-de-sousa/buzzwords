---
term: Inférence
slug: inference
aliases: [Inference, Serving]
tags: [ia]
relations:
  near: [Entraînement, Edge AI, NPU]
  same: [Serving]
  not: [Fine-tuning]
created: 2026-10-15
updated: 2026-10-15
---
**Inférence (Inference)**
- Conceptuellement : l'étape où un modèle déjà entraîné **répond** : il prend une entrée et **produit une prédiction**, par exemple une réponse de chatbot.
- Techniquement : un seul **passage avant** dans le réseau, sans mise à jour des poids. C'est moins lourd que l'entraînement, mais répété **des millions de fois**, donc ça pèse sur le **coût par requête** et la **latence**.
- Sert à : faire tourner l'IA en **production** (API, chatbots, IA embarquée).
- Ex : NVIDIA Dynamo et TensorRT-LLM, vLLM, AWS Inferentia, Groq.
