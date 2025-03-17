import React from 'react';
import { usePromptStore } from '../store/promptStore';
import { 
  PlusCircle, 
  Wand2, 
  Search, 
  Edit, 
  Trash2, 
  ChevronRight, 
  RefreshCw, 
  Copy, 
  X, 
  CheckCircle,
  FileText,
  Table,
  Code,
  MessageSquare,
  Check
} from 'lucide-react';
import { PromptTemplateForm } from '../components/PromptTemplateForm';

interface PromptTemplate {
  id: string;
  name: string;
  trigger: string;
  prompt_text: string;
  description: string | null;
  created_at: string;
  is_system: boolean | null;
}

export function ActionsList() {
  const { templates, fetchTemplates, loading } = usePromptStore();
  const [isPromptFormOpen, setIsPromptFormOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingTemplate, setEditingTemplate] = React.useState<PromptTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [showPreview, setShowPreview] = React.useState<string | null>(null);
  const [copiedTrigger, setCopiedTrigger] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filteredTemplates = React.useMemo(() => {
    return templates.filter(template => 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.trigger.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [templates, searchTerm]);

  const handleCopyTrigger = (trigger: string) => {
    navigator.clipboard.writeText(trigger);
    setCopiedTrigger(trigger);
    setTimeout(() => setCopiedTrigger(null), 2000);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirmDelete === id) {
      // Utiliser la fonction deleteTemplate du store
      usePromptStore.getState().deleteTemplate(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      // Réinitialiser après 3 secondes si l'utilisateur ne confirme pas
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const handleEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate({
      ...template,
      is_system: template.is_system || null
    });
    setIsPromptFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsPromptFormOpen(false);
    setEditingTemplate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-blue-400 animate-pulse">Chargement des actions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* Header avec titre et breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center text-white text-opacity-60 text-sm mb-2">
          <span className="hover:text-opacity-100 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-white">Actions</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white bg-clip-text text-transparent">Actions</h1>
            <div className="bg-white bg-opacity-10 px-2.5 py-1 rounded-full text-xs font-medium">
              {templates.length} actions
            </div>
          </div>
          
          <button
            onClick={() => fetchTemplates()}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-white hover:bg-opacity-5 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Notification de copie */}
      {copiedTrigger && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn z-50">
          <Check className="w-4 h-4" />
          <span>Trigger "{copiedTrigger}" copié !</span>
        </div>
      )}

      {/* Contrôles principaux */}
      <div className="bg-white bg-opacity-[0.03] backdrop-blur-sm border border-white border-opacity-5 rounded-xl p-4 mb-8 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white text-opacity-40" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, trigger, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsPromptFormOpen(true);
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 md:ml-auto transform hover:scale-105"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">Nouvelle action</span>
          </button>
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-white text-opacity-40">
          <FileText className="w-16 h-16 mb-4 opacity-30" />
          <h3 className="text-xl font-medium mb-2">Aucune action trouvée</h3>
          <p className="text-sm max-w-md text-center mb-6">
            Aucune action ne correspond à votre recherche ou la liste est vide.
          </p>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setIsPromptFormOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Créer une action</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white bg-opacity-[0.02] backdrop-blur-sm rounded-xl border border-white border-opacity-5 overflow-hidden transition-all duration-200 hover:bg-opacity-[0.04] hover:border-opacity-10 animate-fadeIn"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      template.trigger.includes('diagnostic') ? 'bg-amber-500/20' : 
                      template.trigger.includes('solution') ? 'bg-emerald-500/20' : 
                      'bg-blue-500/20'
                    }`}>
                      {template.trigger.includes('diagnostic') ? 
                        <Table className="w-5 h-5 text-amber-400" /> : 
                        template.trigger.includes('solution') ? 
                        <CheckCircle className="w-5 h-5 text-emerald-400" /> : 
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                      }
                    </div>
                    <h3 className="text-lg font-medium text-white">{template.name}</h3>
                  </div>
                  {template.is_system && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      Système
                    </span>
                  )}
                </div>
                
                <p className="text-white text-opacity-70 text-sm mb-4 line-clamp-2 hover:line-clamp-none transition-all duration-300">
                  {template.description || "Aucune description disponible."}
                </p>
                
                <div className="flex items-center text-sm text-white text-opacity-60 mb-4">
                  <Wand2 className="w-4 h-4 mr-2 text-blue-400" />
                  <code 
                    className="bg-white bg-opacity-[0.05] px-2 py-1 rounded cursor-pointer hover:bg-opacity-10 transition-colors"
                    onClick={() => handleCopyTrigger(template.trigger)}
                    title="Cliquer pour copier"
                  >
                    {template.trigger}
                  </code>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setShowPreview(template.id === showPreview ? null : template.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-sm"
                  >
                    <Code className="w-4 h-4" />
                    <span>{template.id === showPreview ? "Masquer" : "Voir le prompt"}</span>
                  </button>
                  
                  <button
                    onClick={() => handleCopyTrigger(template.trigger)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copier le trigger</span>
                  </button>
                  
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors text-sm text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                  
                  {!template.is_system && (
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                        confirmDelete === template.id 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-white bg-opacity-5 hover:bg-red-500/10 hover:text-red-400'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{confirmDelete === template.id ? "Confirmer" : "Supprimer"}</span>
                    </button>
                  )}
                </div>
              </div>
              
              {showPreview === template.id && (
                <div className="border-t border-white border-opacity-5 p-6 bg-black bg-opacity-20 animate-slideInUp">
                  <h4 className="text-sm font-medium text-white mb-3 flex items-center">
                    <Code className="w-4 h-4 mr-2 text-blue-400" />
                    Contenu du prompt
                  </h4>
                  <pre className="bg-white bg-opacity-[0.03] p-4 rounded-lg text-white text-opacity-80 text-sm overflow-x-auto whitespace-pre-wrap">
                    {template.prompt_text}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isPromptFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-stone-950 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white border-opacity-10 animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10 bg-gradient-to-r from-white/[0.03] to-transparent">
              <h2 className="text-xl font-bold text-white">
                {editingTemplate ? 'Modifier l\'action' : 'Nouvelle action'}
              </h2>
              <button 
                onClick={handleCloseForm}
                className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <PromptTemplateForm 
                isOpen={isPromptFormOpen} 
                onClose={handleCloseForm} 
                template={editingTemplate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}