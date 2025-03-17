import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Startup } from './workspaceStore';

interface PromptTemplate {
  id: string;
  name: string;
  trigger: string;
  prompt_text: string;
  description: string | null;
  created_at?: string;
  is_system?: boolean;
}

interface PromptStore {
  templates: PromptTemplate[];
  loading: boolean;
  fetchTemplates: () => Promise<void>;
  addPromptTemplate: (template: Omit<PromptTemplate, 'id' | 'created_at'>) => Promise<void>;
  updateTemplate: (id: string, template: Partial<Omit<PromptTemplate, 'id' | 'created_at'>>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  generatePrompt: (trigger: string, startup: Startup, additionalData?: Record<string, string>) => string | null;
  initializeSystemTemplates: () => Promise<void>;
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  templates: [],
  loading: false,

  fetchTemplates: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('prompt_templates')
      .select('*');
    
    if (error) {
      console.error('Error fetching templates:', error);
      return;
    }

    set({ templates: data || [], loading: false });
  },

  addPromptTemplate: async (template) => {
    const { data, error } = await supabase
      .from('prompt_templates')
      .insert([template])
      .select();

    if (error) {
      console.error('Error adding template:', error);
      return;
    }

    set(state => ({
      templates: [...state.templates, data[0]]
    }));
  },

  updateTemplate: async (id, template) => {
    const { error } = await supabase
      .from('prompt_templates')
      .update(template)
      .eq('id', id);

    if (error) {
      console.error('Error updating template:', error);
      return;
    }

    set(state => ({
      templates: state.templates.map(t => 
        t.id === id ? { ...t, ...template } : t
      )
    }));
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase
      .from('prompt_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      return;
    }

    set(state => ({
      templates: state.templates.filter(t => t.id !== id)
    }));
  },

  generatePrompt: (trigger, startup, additionalData = {}) => {
    const template = get().templates.find(t => t.trigger === trigger);
    if (!template) return null;

    const context = {
      startup_name: startup.name,
      sector: startup.sector,
      needs: startup.needs || '',
      problems: startup.problems || '',
      representative: startup.representative,
      ...additionalData
    };

    let promptText = template.prompt_text;
    Object.entries(context).forEach(([key, value]) => {
      promptText = promptText.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return promptText;
  },

  initializeSystemTemplates: async () => {
    const systemTemplates = [
      {
        name: 'Diagnostic Initial',
        trigger: 'diagnostic',
        prompt_text: `Vous êtes un expert en analyse d'entreprises et en diagnostic stratégique. Votre rôle est d'analyser en profondeur la situation d'une startup et d'identifier ses principaux défis et opportunités.

IMPORTANT: Respectez strictement la structure suivante dans votre réponse, en utilisant exactement ces titres de sections:

BESOINS:
[Reformulez ici les besoins réels de la startup, au-delà de ce qui est exprimé. Mettez en gras les besoins critiques.]

PROBLÈME GLOBAL:
[Identifiez le problème fondamental ou le défi principal auquel la startup fait face. Soyez précis et concis. Mettez en gras les éléments clés.]

PROBLÈME REFORMULÉ:
[Reformulez le problème d'une manière qui ouvre des pistes de solutions. Mettez en gras les concepts importants.]

ANALYSE DU MARCHÉ:
[Analysez brièvement le marché et le positionnement de la startup. Mettez en gras les opportunités et menaces principales.]

FORCES ET FAIBLESSES:
[Identifiez les principales forces et faiblesses de la startup. Mettez en gras les éléments les plus significatifs.]

OBSTACLES CRITIQUES:
[Listez les 3-5 obstacles majeurs qui empêchent la startup d'atteindre ses objectifs. Mettez en gras les obstacles prioritaires.]

OPPORTUNITÉS INEXPLOITÉES:
[Identifiez 2-4 opportunités que la startup pourrait saisir. Mettez en gras les opportunités à fort potentiel.]

Veuillez analyser la startup suivante :

Nom : {startup_name}
Secteur : {sector}
Besoins exprimés : {needs}
Problèmes identifiés : {problems}
Représentant : {representative}

{additional_context}

Fournissez une analyse structurée des défis et opportunités de cette startup en suivant strictement la structure demandée.`,
        description: 'Analyse approfondie des défis et besoins réels de la startup',
        is_system: true
      },
      {
        name: 'Solutions et Recommandations',
        trigger: 'solutions',
        prompt_text: `Vous êtes un expert en stratégie d'entreprise et en accompagnement de startups. Votre rôle est de proposer des solutions concrètes et des recommandations actionnables basées sur le diagnostic précédent.

IMPORTANT: Respectez strictement la structure suivante dans votre réponse, en utilisant exactement ces titres de sections:

SOLUTIONS PRIORITAIRES:
[Listez ici 3 à 5 solutions prioritaires, chacune en 1-2 phrases. Mettez en gras les mots-clés importants.]

PLAN D'ACTION:
[Détaillez ici un plan d'action concret en 5-7 étapes, avec un calendrier approximatif. Mettez en gras les actions principales.]

RECOMMANDATIONS STRATÉGIQUES:
[Proposez 3-4 recommandations stratégiques à moyen/long terme. Mettez en gras les concepts clés.]

RESSOURCES NÉCESSAIRES:
[Listez les ressources humaines, financières ou techniques nécessaires. Mettez en gras les ressources critiques.]

INDICATEURS DE SUCCÈS:
[Proposez 3-5 indicateurs mesurables pour évaluer le succès des solutions. Mettez en gras les métriques principales.]

Assurez-vous que chaque recommandation est :
- Concrète et actionnable
- Adaptée aux ressources de la startup
- Alignée avec les objectifs identifiés
- Priorisée selon l'impact et l'urgence

Sur la base du diagnostic suivant :

{diagnostic_results}

Pour la startup :
Nom : {startup_name}
Secteur : {sector}

Veuillez proposer un plan d'action détaillé et des recommandations stratégiques en suivant strictement la structure demandée.`,
        description: 'Génération de solutions concrètes et plan d\'action détaillé',
        is_system: true
      }
    ];

    for (const template of systemTemplates) {
      const { data } = await supabase
        .from('prompt_templates')
        .select()
        .eq('trigger', template.trigger)
        .single();

      if (!data) {
        await get().addPromptTemplate(template);
      }
    }
  }
}));