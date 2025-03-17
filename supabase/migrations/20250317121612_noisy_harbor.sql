/*
  # Add solutions template

  1. Changes
    - Adds a new system template for generating solutions
*/

INSERT INTO prompt_templates (name, trigger, prompt_text, description, is_system)
VALUES (
  'Solutions et Plan d''Action',
  'solutions',
  E'La startup {startup_name} évolue dans le secteur {sector} et rencontre le problème suivant :\n\n🛑 Problème identifié : {problems}\n📌 Reformulation experte du besoin : {needs}\n\n🔹 Objectif du diagnostic :\n1️⃣ Identifier des solutions concrètes, actionnables et adaptées pour résoudre ce problème.\n2️⃣ Proposer des recommandations stratégiques en lien avec son secteur d''activité.\n3️⃣ Définir un plan d''action précis, priorisé et réalisable en fonction des ressources d''une startup.\n\n🔹 Format de réponse attendu :\n\n🎯 Solutions adaptées → 3 à 5 recommandations précises, détaillées et immédiatement actionnables.\n🛠️ Stratégie de mise en œuvre → Explication sur comment appliquer chaque solution, avec des étapes claires.\n📈 Résultats attendus → Impact prévu sur la croissance, l''acquisition client, l''optimisation produit ou tout autre indicateur clé.',
  'Génération de solutions concrètes et plan d''action détaillé',
  true
)
ON CONFLICT (trigger) DO NOTHING;