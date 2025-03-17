import React from 'react';
import { usePromptStore } from '../store/promptStore';

interface PromptTemplate {
  id: string;
  name: string;
  trigger: string;
  prompt_text: string;
  description: string | null;
  created_at: string;
  is_system: boolean | null;
}

interface PromptTemplateFormProps {
  isOpen: boolean;
  onClose: () => void;
  template?: PromptTemplate | null;
}

export function PromptTemplateForm({ isOpen, onClose, template }: PromptTemplateFormProps) {
  const addPromptTemplate = usePromptStore(state => state.addPromptTemplate);
  const updateTemplate = usePromptStore(state => state.updateTemplate);
  const [formData, setFormData] = React.useState({
    name: '',
    trigger: '',
    prompt_text: '',
    description: '',
    is_system: false
  });
  
  React.useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        trigger: template.trigger,
        prompt_text: template.prompt_text,
        description: template.description || '',
        is_system: template.is_system || false
      });
    } else {
      setFormData({
        name: '',
        trigger: '',
        prompt_text: '',
        description: '',
        is_system: false
      });
    }
  }, [template]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (template) {
      await updateTemplate(template.id, formData);
    } else {
      await addPromptTemplate(formData);
    }
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
          Nom de l'action
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
      </div>

      <div>
        <label htmlFor="trigger" className="block text-sm font-medium text-white mb-2">
          Trigger (mot-clé pour déclencher l'action)
        </label>
        <input
          type="text"
          id="trigger"
          name="trigger"
          value={formData.trigger}
          onChange={handleChange}
          className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />
        <p className="mt-1 text-sm text-white text-opacity-60">
          Exemple: "diagnostic", "solution", etc.
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={2}
          className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div>
        <label htmlFor="prompt_text" className="block text-sm font-medium text-white mb-2">
          Texte du prompt
        </label>
        <textarea
          id="prompt_text"
          name="prompt_text"
          value={formData.prompt_text}
          onChange={handleChange}
          rows={10}
          className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono text-sm"
          required
        />
        <p className="mt-1 text-sm text-white text-opacity-60">
          Utilisez les variables suivantes: {"{startup_name}"}, {"{sector}"}, {"{needs}"}, {"{problems}"}, {"{representative}"}
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_system"
          name="is_system"
          checked={formData.is_system}
          onChange={(e) => setFormData(prev => ({ ...prev, is_system: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_system" className="ml-2 block text-sm text-white">
          Action système (ne peut pas être supprimée)
        </label>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
        >
          {template ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}