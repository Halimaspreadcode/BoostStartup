import React from 'react';
import { X, Wand2 } from 'lucide-react';
import { useStartupStore } from '../store/startupStore';
import { usePromptStore } from '../store/promptStore';
import { generateSuggestions } from '../lib/gemini';

interface TimelineFormProps {
  isOpen: boolean;
  onClose: () => void;
  startupId: string;
}

export function TimelineForm({ isOpen, onClose, startupId }: TimelineFormProps) {
  const addTimelineEvent = useStartupStore(state => state.addTimelineEvent);
  const startup = useStartupStore(state => state.startups.find(s => s.id === startupId));
  const { templates, fetchTemplates } = usePromptStore();
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [aiResponse, setAiResponse] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen, fetchTemplates]);

  if (!isOpen || !startup) return null;

  const handleTemplateSelect = async (trigger: string) => {
    setSelectedTemplate(trigger);
    const prompt = usePromptStore.getState().generatePrompt(trigger, startup);
    if (!prompt) return;

    setIsLoading(true);
    try {
      const response = await generateSuggestions(prompt);
      setAiResponse(response);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setAiResponse('Une erreur est survenue lors de la génération des suggestions.');
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate || !aiResponse) return;
    
    await addTimelineEvent(startupId, {
      date: new Date().toISOString().split('T')[0],
      action: templates.find(t => t.trigger === selectedTemplate)?.name || '',
      description: aiResponse,
    });
    
    onClose();
    setSelectedTemplate(null);
    setAiResponse('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-950 rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold">Nouvelle action pour {startup.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-3">Actions disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.trigger)}
                  className={`p-4 rounded-lg text-left transition-colors ${
                    selectedTemplate === template.trigger
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{template.name}</span>
                    <Wand2 className={`w-4 h-4 ${
                      selectedTemplate === template.trigger ? 'text-white' : 'text-blue-500'
                    }`} />
                  </div>
                  <p className={`text-sm mt-1 ${
                    selectedTemplate === template.trigger
                      ? 'text-blue-50'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {aiResponse && !isLoading && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="prose dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{aiResponse}</div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedTemplate || !aiResponse || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              Enregistrer l'action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}