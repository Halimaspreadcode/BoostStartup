import React from 'react';
import { useStartupStore } from '../store/startupStore';
import { usePromptStore } from '../store/promptStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { Step, Startup as WorkspaceStartup } from '../store/workspaceStore';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  PlusCircle, 
  Trash2, 
  Loader2, 
  ClipboardList,
  Lightbulb,
  ArrowRight,
  CheckCircle,
  FileText,
  MessageSquare,
  Brain,
  Target,
  Sparkles,
  ChevronRight,
  InfoIcon
} from 'lucide-react';
import { generateSuggestions } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

export function Workspace() {
  const { startups, fetchStartups } = useStartupStore();
  const { templates, fetchTemplates } = usePromptStore();
  const { 
    steps, 
    activeStep, 
    currentPhase,
    addStep: addWorkspaceStep,
    removeStep: removeWorkspaceStep,
    updateStep: updateWorkspaceStep,
    setActiveStep,
    setCurrentPhase
  } = useWorkspaceStore();
  const [processing, setProcessing] = React.useState(false);

  React.useEffect(() => {
    fetchTemplates();
    fetchStartups();
  }, [fetchTemplates, fetchStartups]);

  const addStep = () => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      name: `Session ${steps.length + 1}`,
      startups: [],
      actions: [],
      interviews: {}
    };
    addWorkspaceStep(newStep);
  };

  const removeStep = (stepId: string) => {
    removeWorkspaceStep(stepId);
  };

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    updateWorkspaceStep(stepId, updates);
  };

  const executeProcess = async (step: Step) => {
    setProcessing(true);
    try {
      const results = [];
      const diagnosticResults = new Map();
      const diagnosticTemplate = templates.find(t => t.trigger === 'diagnostic');
      const solutionsTemplate = templates.find(t => t.trigger === 'solutions');

      // Phase de diagnostic
      if (currentPhase === 'diagnostic' && diagnosticTemplate) {
        for (const startupId of step.startups) {
          const startup = startups.find(s => s.id === startupId);
          if (!startup) continue;

          // Préparation des informations pour le diagnostic
          const interviewNotes = step.interviews[startupId]?.trim() || '';
          const contextInfo = `
Informations de la startup:
- Nom: ${startup.name}
- Secteur: ${startup.sector}
- Représentant: ${startup.representative}
- Besoins exprimés: ${startup.needs || 'Non spécifiés'}
- Problèmes identifiés: ${startup.problems || 'Non spécifiés'}

Notes d'entretien et observations:
${interviewNotes || 'Aucune note d\'entretien fournie'}
`;

          const prompt = usePromptStore.getState().generatePrompt(
            'diagnostic',
            startup as unknown as WorkspaceStartup,
            { 
              interviews: contextInfo,
              additional_context: interviewNotes 
            }
          );

          if (prompt) {
            try {
              const response = await generateSuggestions(prompt);
              
              // Formatage structuré du diagnostic pour faciliter l'extraction ultérieure
              const formattedResponse = `
Besoins: ${startup.needs || 'Non spécifiés'}

Problème global: ${response.match(/(?:Problème global|Probleme global|PROBLÈME GLOBAL).*?[:]([\s\S]*?)(?=(?:\n\n|\n)(?:Problème reformulé|Probleme reformule|PROBLÈME REFORMULÉ|$))/i)?.[1]?.trim() || response.split('\n\n')[0]}

Problème reformulé: ${response.match(/(?:Problème reformulé|Probleme reformule|PROBLÈME REFORMULÉ).*?[:]([\s\S]*?)(?=(?:\n\n|\n)(?:[A-Z]|$))/i)?.[1]?.trim() || response.split('\n\n')[1] || ''}

Analyse détaillée:
${response}
`;
              
              // Extraire le résumé concis du diagnostic
              const summary = await generateSuggestions(`En te basant sur l'analyse suivante, résume de façon concise et experte les problèmes principaux et les points clés identifiés : ${response}`);
              
              // Sauvegarder le résultat en base de données
              const { error: workspaceError } = await supabase
                .from('workspace_results')
                .insert({
                  step_id: step.id,
                  startup_id: startupId,
                  phase: 'diagnostic',
                  response: formattedResponse,
                  summary
                })
                .select()
                .single();

              if (workspaceError) {
                console.error('Error saving workspace result:', workspaceError);
                continue;
              }

              diagnosticResults.set(startupId, formattedResponse);
              results.push({
                startupId,
                actionId: diagnosticTemplate.id,
                response: formattedResponse,
                summary
              });

              await useStartupStore.getState().updateDiagnostic(startupId, formattedResponse);
              await useStartupStore.getState().addTimelineEvent(startupId, {
                date: new Date().toISOString(),
                action: "Diagnostic",
                description: formattedResponse,
                context: interviewNotes ? "Basé sur les notes d'entretien" : "Diagnostic initial"
              });
            } catch (error) {
              console.error(`Error processing diagnostic for startup ${startup.name}:`, error);
            }
          }
        }
      }

      // Phase de solutions
      if (currentPhase === 'solutions' && solutionsTemplate) {
        for (const startupId of step.startups) {
          const startup = startups.find(s => s.id === startupId);
          if (!startup || !startup.diagnostic_results) continue;

          const prompt = usePromptStore.getState().generatePrompt(
            'solutions',
            startup as unknown as WorkspaceStartup,
            { diagnostic_results: startup.diagnostic_results }
          );

          if (prompt) {
            try {
              const response = await generateSuggestions(prompt);
              
              // Formatage structuré des solutions pour faciliter l'extraction ultérieure
              const formattedResponse = `
Solutions prioritaires: ${response.match(/(?:Solutions prioritaires|SOLUTIONS PRIORITAIRES).*?[:]([\s\S]*?)(?=(?:\n\n|\n)(?:Plan d'action|PLAN D'ACTION|$))/i)?.[1]?.trim() || response.split('\n\n')[0] || ''}

Plan d'action: ${response.match(/(?:Plan d'action|PLAN D'ACTION).*?[:]([\s\S]*?)(?=(?:\n\n|\n)(?:Recommandations|RECOMMANDATIONS|$))/i)?.[1]?.trim() || response.split('\n\n')[1] || ''}

Recommandations détaillées:
${response}
`;

              // Sauvegarder le résultat en base de données
              const { error: workspaceError } = await supabase
                .from('workspace_results')
                .insert({
                  step_id: step.id,
                  startup_id: startupId,
                  phase: 'solutions',
                  response: formattedResponse
                })
                .select()
                .single();

              if (workspaceError) {
                console.error('Error saving workspace result:', workspaceError);
                continue;
              }

              results.push({
                startupId,
                actionId: solutionsTemplate.id,
                response: formattedResponse
              });

              await useStartupStore.getState().addTimelineEvent(startupId, {
                date: new Date().toISOString(),
                action: "Solutions proposées",
                description: formattedResponse
              });
            } catch (error) {
              console.error(`Error processing solutions for startup ${startup.name}:`, error);
            }
          }
        }
      }

      if (results.length > 0) {
        updateStep(step.id, { results });
        
        // Rediriger vers la page des résultats après le traitement
        setTimeout(() => {
          window.location.href = '/workspace-results';
        }, 1000);
      }
    } catch (error) {
      console.error('Error executing process:', error);
    } finally {
      setProcessing(false);
    }
  };

  const canExecuteProcess = (step: Step) => {
    if (step.startups.length === 0) return false;
    
    if (currentPhase === 'diagnostic') {
      // On ne vérifie plus si les interviews sont remplies, car elles sont optionnelles
      return true;
    }
    
    if (currentPhase === 'solutions') {
      return step.startups.every(startupId => {
        const startup = startups.find(s => s.id === startupId);
        return startup?.diagnostic_results;
      });
    }
    
    return false;
  };

  return (
    <div className="text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center text-white text-opacity-60 text-sm mb-2">
            <span className="hover:text-opacity-100 cursor-pointer">Dashboard</span>
            <ChevronRight className="w-3 h-3 mx-2" />
            <span className="text-white">Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Sessions de travail</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/workspace-results"
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-lg shadow-purple-500/20"
          >
            <FileText className="w-5 h-5" />
            <span>Voir les résultats</span>
          </Link>
          <button
            onClick={addStep}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Nouvelle session</span>
          </button>
        </div>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 bg-white bg-opacity-[0.02] rounded-xl border border-white border-opacity-5">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-blue-500/20 rounded-full">
              <ClipboardList className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-2">
                Commencez une nouvelle session
              </h3>
              <p className="text-white text-opacity-60 max-w-md mx-auto mb-6">
                Créez une session pour analyser les besoins des startups et proposer des solutions adaptées
              </p>
            </div>
            <button
              onClick={addStep}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Créer une session</span>
            </button>
          </div>
        </div>
      ) : (
        <Tabs.Root
          value={activeStep || steps[0].id}
          onValueChange={setActiveStep}
        >
          <div className="flex items-center border-b border-white border-opacity-10 mb-6">
            <Tabs.List className="flex">
              {steps.map(step => (
                <div key={step.id} className="group relative">
                  <Tabs.Trigger
                    value={step.id}
                    className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-white hover:text-gray-300 data-[state=active]:border-blue-500 data-[state=active]:text-blue-400"
                  >
                    {step.name}
                  </Tabs.Trigger>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(step.id);
                    }}
                    className="absolute -right-2 -top-2 p-1 rounded-full bg-red-900 text-red-100 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </Tabs.List>
          </div>

          {steps.map(step => (
            <Tabs.Content
              key={step.id}
              value={step.id}
              className="focus:outline-none"
            >
              <div className="space-y-6">
                {/* Phase Selector */}
                <div className="bg-white bg-opacity-[0.02] rounded-xl p-6 border border-white border-opacity-5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Brain className="w-5 h-5 text-blue-400" />
                      Phase actuelle
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setCurrentPhase('diagnostic')}
                      className={`flex-1 p-4 rounded-lg border transition-all ${
                        currentPhase === 'diagnostic'
                          ? 'bg-blue-500/10 border-blue-500/50 shadow-lg shadow-blue-500/10'
                          : 'border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          currentPhase === 'diagnostic' ? 'bg-blue-500/20' : 'bg-white/5'
                        }`}>
                          <FileText className={`w-5 h-5 ${
                            currentPhase === 'diagnostic' ? 'text-blue-400' : 'text-white/60'
                          }`} />
                        </div>
                        <span className="font-medium">Diagnostic</span>
                        {step.results?.some(r => r.summary) && (
                          <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
                        )}
                      </div>
                      <p className="text-sm text-white/60">
                        Analyser les besoins et problèmes des startups
                      </p>
                    </button>
                    <div className="flex items-center text-white/20">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                    <button
                      onClick={() => setCurrentPhase('solutions')}
                      disabled={!step.results?.some(r => r.summary)}
                      className={`flex-1 p-4 rounded-lg border transition-all ${
                        currentPhase === 'solutions'
                          ? 'bg-purple-500/10 border-purple-500/50 shadow-lg shadow-purple-500/10'
                          : 'border-white/5 hover:border-white/10'
                      } ${!step.results?.some(r => r.summary) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          currentPhase === 'solutions' ? 'bg-purple-500/20' : 'bg-white/5'
                        }`}>
                          <Lightbulb className={`w-5 h-5 ${
                            currentPhase === 'solutions' ? 'text-purple-400' : 'text-white/60'
                          }`} />
                        </div>
                        <span className="font-medium">Solutions</span>
                      </div>
                      <p className="text-sm text-white/60">
                        Proposer des solutions basées sur le diagnostic
                      </p>
                    </button>
                  </div>
                </div>

                {/* Startup Selection */}
                <div className="bg-white bg-opacity-[0.02] rounded-xl p-6 border border-white border-opacity-5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      Startups sélectionnées
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {startups.map(startup => (
                      <div 
                        key={startup.id} 
                        className={`p-4 rounded-lg border transition-all ${
                          step.startups.includes(startup.id)
                            ? 'bg-white/5 border-white/20'
                            : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-start">
                          <label className="flex items-center flex-1">
                            <input
                              type="checkbox"
                              checked={step.startups.includes(startup.id)}
                              onChange={(e) => {
                                const newStartups = e.target.checked
                                  ? [...step.startups, startup.id]
                                  : step.startups.filter(id => id !== startup.id);
                                updateStep(step.id, { startups: newStartups });
                              }}
                              className="rounded border-white/20 text-blue-500 focus:ring-blue-500 bg-white/5"
                            />
                            <div className="ml-3">
                              <div className="font-medium">{startup.name}</div>
                              <div className="text-sm text-white/60">{startup.sector}</div>
                            </div>
                          </label>
                          {step.startups.includes(startup.id) && currentPhase === 'diagnostic' && (
                            <div className="flex-1 ml-4">
                              <div className="relative">
                                <div className="absolute top-2 left-3">
                                  <MessageSquare className="w-4 h-4 text-white/40" />
                                </div>
                                <textarea
                                  value={step.interviews[startup.id] || ''}
                                  onChange={(e) => {
                                    const newInterviews = {
                                      ...step.interviews,
                                      [startup.id]: e.target.value
                                    };
                                    updateStep(step.id, { interviews: newInterviews });
                                  }}
                                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-y"
                                  placeholder="Notes d'entretien, observations, informations supplémentaires..."
                                />
                                <div className="mt-2 text-xs text-white/60 flex items-center gap-1">
                                  <InfoIcon className="w-3 h-3" />
                                  <span>Ces notes enrichiront l'analyse du diagnostic (optionnel)</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                {step.startups.length > 0 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => executeProcess(step)}
                      disabled={processing || !canExecuteProcess(step)}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-blue-500/20"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Traitement en cours...</span>
                        </>
                      ) : currentPhase === 'diagnostic' ? (
                        <>
                          <Brain className="w-5 h-5" />
                          <span>Lancer le diagnostic</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Générer les solutions</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Ne plus afficher les résultats ici, ils seront visibles sur la page dédiée */}
                {step.results && step.results.length > 0 && (
                  <div className="bg-white bg-opacity-[0.02] rounded-xl p-6 border border-white border-opacity-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-white flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-emerald-400" />
                        Résultats disponibles
                      </h3>
                    </div>
                  </div>
                )}
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      )}
    </div>
  );
}