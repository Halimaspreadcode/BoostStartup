-- Create prompt_templates table if not exists
CREATE TABLE IF NOT EXISTS prompt_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  trigger text NOT NULL UNIQUE,
  prompt_text text NOT NULL,
  description text,
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can read prompt templates'
  ) THEN
    CREATE POLICY "Users can read prompt templates"
      ON prompt_templates
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can manage their prompt templates'
  ) THEN
    CREATE POLICY "Users can manage their prompt templates"
      ON prompt_templates
      FOR ALL
      TO authenticated
      USING (NOT is_system)
      WITH CHECK (NOT is_system);
  END IF;
END
$$;

-- Insert system templates if they don't exist
DO $$
BEGIN
  -- Diagnostic template
  IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE trigger = 'diagnostic') THEN
    INSERT INTO prompt_templates (name, trigger, prompt_text, description, is_system)
    VALUES (
      'Diagnostic Initial',
      'diagnostic',
      'Vous êtes un expert en analyse d''entreprises et en diagnostic stratégique. Votre rôle est d''analyser en profondeur la situation d''une startup et d''identifier ses principaux défis et opportunités. Concentrez-vous sur les points suivants :

1. Analyse du marché et du positionnement
2. Évaluation des besoins exprimés
3. Identification des problèmes sous-jacents
4. Points forts et points faibles
5. Opportunités et menaces

Fournissez une analyse concise mais complète, en mettant en évidence les points critiques qui nécessitent une attention immédiate.

Veuillez analyser la startup suivante :

Nom : {startup_name}
Secteur : {sector}
Besoins exprimés : {needs}
Problèmes identifiés : {problems}
Représentant : {representative}

{additional_context}

Fournissez une analyse structurée des défis et opportunités de cette startup.',
      'Analyse approfondie des défis et besoins réels de la startup',
      true
    );
  END IF;

  -- Solutions template
  IF NOT EXISTS (SELECT 1 FROM prompt_templates WHERE trigger = 'solutions') THEN
    INSERT INTO prompt_templates (name, trigger, prompt_text, description, is_system)
    VALUES (
      'Solutions et Recommandations',
      'solutions',
      'Vous êtes un expert en stratégie d''entreprise et en accompagnement de startups. Votre rôle est de proposer des solutions concrètes et des recommandations actionnables basées sur le diagnostic précédent. Structurez vos recommandations selon les sections suivantes :

1. Solutions prioritaires
2. Plan d''action détaillé
3. Recommandations stratégiques
4. Ressources et accompagnement nécessaires
5. Indicateurs de succès

Assurez-vous que chaque recommandation est :
- Concrète et actionnable
- Adaptée aux ressources de la startup
- Alignée avec les objectifs identifiés
- Priorisée selon l''impact et l''urgence

Sur la base du diagnostic suivant :

{diagnostic_results}

Pour la startup :
Nom : {startup_name}
Secteur : {sector}

Veuillez proposer un plan d''action détaillé et des recommandations stratégiques.',
      'Génération de solutions concrètes et plan d''action détaillé',
      true
    );
  END IF;
END
$$; 