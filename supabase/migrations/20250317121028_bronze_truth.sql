/*
  # Update diagnostic template content

  1. Changes
    - Updates the prompt text for the diagnostic system template
*/

UPDATE prompt_templates 
SET prompt_text = E'En tant qu\'expert en analyse d\'entreprise, réalise un diagnostic précis et structuré pour la startup suivante :\n\nNom : {startup_name}\nSecteur : {sector}\nBesoins exprimés : {needs}\n\nFournis une analyse en deux points distincts, chacun en un seul paragraphe :\n\n1. Problème global : Une explication approfondie qui expose clairement le défi structurel ou opérationnel de la startup et ce dont elle a réellement besoin pour avancer.\n\n2. Problème reformulé : Une formulation synthétique et impactante du problème principal.\n\nAssure-toi que chaque point soit concis, précis et directement exploitable.'
WHERE trigger = 'diagnostic' AND is_system = true;