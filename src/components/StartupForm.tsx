import React from 'react';
import { X, Save, User, Briefcase, Tag, AlertCircle, FileText } from 'lucide-react';
import { useStartupStore } from '../store/startupStore';
import { ActionResults } from './ActionResults';

interface StartupFormProps {
  isOpen: boolean;
  onClose: () => void;
  startupId?: string;
}

export function StartupForm({ isOpen, onClose, startupId }: StartupFormProps) {
  const addStartup = useStartupStore(state => state.addStartup);
  const updateStartup = useStartupStore(state => state.updateStartup);
  const startup = useStartupStore(state => startupId ? state.startups.find(s => s.id === startupId) : null);
  const [formData, setFormData] = React.useState({
    name: '',
    representative: '',
    sector: '',
    needs: '',
  });
  const [showResults, setShowResults] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (startup) {
      setFormData({
        name: startup.name,
        representative: startup.representative,
        sector: startup.sector,
        needs: startup.needs,
      });
    }
  }, [startup]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    try {
      setIsSubmitting(true);
      
      if (!startupId) {
        // Création d'une nouvelle startup
        await addStartup({
          ...formData,
          status: 'To Analyze',
          timeline: [],
          resources: [],
          problems: '',
          solutions: '',
          diagnostic_results: null,
        });
        onClose();
        setFormData({ name: '', representative: '', sector: '', needs: '' });
      } else {
        // Mise à jour d'une startup existante
        await updateStartup(startupId, formData);
      }
    } catch (error) {
      setFormError("Une erreur s'est produite lors de l'enregistrement. Veuillez réessayer.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Détermine si le champ est en lecture seule
  const isReadOnly = Boolean(startupId);
  
  // Classes pour les champs en lecture seule ou modifiables
  const getInputClasses = () => {
    const baseClasses = "w-full rounded-md bg-white bg-opacity-5 border-0 focus:ring-1 focus:ring-white focus:ring-opacity-30 text-white placeholder-white placeholder-opacity-40";
    return isReadOnly
      ? `${baseClasses} opacity-70 cursor-not-allowed`
      : baseClasses;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-black rounded-lg w-full max-w-4xl border border-white border-opacity-10 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {startupId ? startup?.name : 'Nouvelle startup'}
            </h2>
            {startupId && (
              <div className="flex space-x-1 bg-white bg-opacity-5 p-0.5 rounded-md">
                <button
                  onClick={() => setShowResults(false)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center ${
                    !showResults
                      ? 'bg-white bg-opacity-10 text-white'
                      : 'text-white text-opacity-60 hover:text-opacity-100'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mr-1.5 opacity-70" />
                  Informations
                </button>
                <button
                  onClick={() => setShowResults(true)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center ${
                    showResults
                      ? 'bg-white bg-opacity-10 text-white'
                      : 'text-white text-opacity-60 hover:text-opacity-100'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-1.5 opacity-70" />
                  Résultats
                </button>
              </div>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="text-white text-opacity-60 hover:text-opacity-100 p-1 rounded-full hover:bg-white hover:bg-opacity-5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {formError && (
          <div className="mx-6 mt-6 p-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-20 rounded-md flex items-center text-red-400">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <p className="text-sm">{formError}</p>
          </div>
        )}
        
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {!showResults ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 text-white text-opacity-80 flex items-center">
                    <Briefcase className="w-4 h-4 mr-2 text-white text-opacity-60" />
                    Nom de la startup
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={getInputClasses()}
                    required
                    readOnly={isReadOnly}
                  />
                </div>

                <div>
                  <label htmlFor="representative" className="block text-sm font-medium mb-2 text-white text-opacity-80 flex items-center">
                    <User className="w-4 h-4 mr-2 text-white text-opacity-60" />
                    Représentant
                  </label>
                  <input
                    type="text"
                    id="representative"
                    value={formData.representative}
                    onChange={e => setFormData(prev => ({ ...prev, representative: e.target.value }))}
                    className={getInputClasses()}
                    required
                    readOnly={isReadOnly}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="sector" className="block text-sm font-medium mb-2 text-white text-opacity-80 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-white text-opacity-60" />
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  id="sector"
                  value={formData.sector}
                  onChange={e => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                  className={getInputClasses()}
                  required
                  readOnly={isReadOnly}
                />
              </div>

              <div>
                <label htmlFor="needs" className="block text-sm font-medium mb-2 text-white text-opacity-80 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-white text-opacity-60" />
                  Besoins (mots-clés)
                </label>
                <textarea
                  id="needs"
                  value={formData.needs}
                  onChange={e => setFormData(prev => ({ ...prev, needs: e.target.value }))}
                  placeholder="Ex: financement, marketing, développement..."
                  className={getInputClasses()}
                  rows={3}
                  readOnly={isReadOnly}
                />
                <p className="mt-2 text-xs text-white text-opacity-40">
                  Séparez les besoins par des virgules
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white border-opacity-10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white text-opacity-80 hover:text-opacity-100 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-md transition-colors"
                >
                  {startupId ? 'Fermer' : 'Annuler'}
                </button>
                {!startupId && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-white bg-opacity-10 hover:bg-opacity-15 rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Création...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Ajouter
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="p-6 min-h-[400px]">
              {startupId && <ActionResults startupId={startupId} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}