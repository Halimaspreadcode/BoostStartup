-- Mise à jour du prompt pour les solutions et recommandations
UPDATE prompt_templates
SET prompt_text = 'En tant qu''expert en stratégie digitale, analyse les besoins et problèmes de la startup {{startup_name}} et propose des solutions concrètes et réalisables. Utilise le format suivant pour structurer ta réponse :

SOLUTIONS PRIORITAIRES:
- Liste ici 3 à 5 solutions prioritaires sous forme de mots-clés ou phrases courtes (ex: "Créer une campagne Instagram Ads", "Recruter un community manager", "Optimiser le site web pour le SEO")
- Chaque solution doit être réaliste, actionnable et adaptée aux ressources de la startup
- Priorise les solutions à fort impact et faible coût

PLAN D''ACTION:
Décris en un paragraphe concis comment mettre en œuvre ces solutions de manière cohérente. Explique brièvement l''ordre logique des actions, les ressources nécessaires et le timing approximatif. Le plan doit être réaliste et tenir compte des contraintes budgétaires mentionnées.

RÉSEAUX RECOMMANDÉS:
Liste ici les 2-3 réseaux sociaux ou canaux de communication les plus pertinents pour cette startup, séparés par des virgules (ex: Instagram, LinkedIn, Email marketing)

OUTILS RECOMMANDÉS:
Liste ici 3-5 outils spécifiques qui aideront à mettre en œuvre les solutions, séparés par des virgules (ex: Canva, Hootsuite, Google Analytics, Mailchimp)

RECOMMANDATIONS STRATÉGIQUES:
Fournis 2-3 conseils stratégiques supplémentaires pour maximiser l''impact des solutions proposées. Ces recommandations doivent être spécifiques, actionnables et adaptées au contexte de la startup.

Assure-toi que toutes les recommandations sont:
1. Concrètes et actionnables
2. Adaptées aux ressources et contraintes de la startup
3. Priorisées selon l''impact et la facilité de mise en œuvre
4. Cohérentes avec le problème identifié dans le diagnostic'
WHERE template_type = 'solutions'; 