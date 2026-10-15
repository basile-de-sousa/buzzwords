---
term: Floating-Point Operations Per Second
slug: floating-point-operations-per-second
acronym: FLOPS
tags: [infrastructure]
relations:
  near: [TOPS, Exascale, FPU]
  not: [FLOP]
created: 2026-10-15
updated: 2026-10-15
---
**Floating-Point Operations Per Second (FLOPS)**
- Conceptuellement : l'**unité de puissance de calcul**, soit le nombre de **calculs à virgule** qu'une machine fait par seconde.
- Échelle : giga (10⁹, un PC ancien) → **téra** (10¹², un GPU grand public) → **péta** (10¹⁵, un GPU de datacenter en IA) → **exa** (10¹⁸, les plus gros supercalculateurs).
- Attention : le chiffre dépend de la **précision**. Le **FP64** sert au calcul scientifique, alors que le **FP8 / FP4** sert à l'IA et affiche des FLOPS bien plus élevés. Les chiffres « IA » des constructeurs ne sont donc pas comparables à ceux du HPC.
- Ex : classement TOP500 (benchmark HPL, en FP64), fiches techniques NVIDIA « AI petaFLOPS ».
