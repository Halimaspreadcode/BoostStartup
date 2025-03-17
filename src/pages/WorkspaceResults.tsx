import React from 'react';
import { useStartupStore, Startup } from '../store/startupStore';
import { supabase } from '../lib/supabase';
import { 
  ChevronRight, 
  FileText, 
  Lightbulb, 
  RefreshCw, 
  Search,
  Filter,
  ArrowUpDown,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Music,
  Globe,
  Mail,
  MessageSquare,
  Camera,
  Video,
  BarChart,
  Calendar,
  PenTool,
  Smartphone,
  Headphones,
  Settings,
  X,
  Save,
  AlertCircle,
  Info,
  HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkspaceResult {
  id: string;
  step_id: string;
  startup_id: string;
  phase: 'diagnostic' | 'solutions';
  response: string;
  summary?: string;
  created_at: string;
}

// Composant Modal pour l'édition
const EditModal = ({ 
  isOpen, 
  onClose, 
  title,
  children,
  onSave,
  isSaving
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  isSaving: boolean;
}) => {
  // Animation d'entrée/sortie
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity animate-fadeIn">
      <div 
        className="bg-gradient-to-b from-gray-900 to-gray-800 border border-white/10 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-black/30">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {title.includes('diagnostic') ? (
              <FileText className="w-5 h-5 text-blue-400" />
            ) : (
              <Lightbulb className="w-5 h-5 text-purple-400" />
            )}
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          <div className="bg-gradient-to-r from-blue-500/20 to-blue-500/5 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-500/30">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-white/90">
              <p className="font-medium mb-1">Conseils pour l'édition :</p>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li><span className="bg-neutral-950/70 px-1.5 py-0.5 rounded text-xs font-mono">**texte**</span> pour du texte en <span className="font-bold">gras</span></li>
                <li><span className="bg-neutral-950/70 px-1.5 py-0.5 rounded text-xs font-mono">*texte*</span> pour du texte en <span className="italic">italique</span></li>
                <li>Pour les <span className="text-blue-300">réseaux sociaux</span>, séparez-les par des virgules (ex: Instagram, Facebook, LinkedIn)</li>
                <li>Pour les <span className="text-green-300">outils</span>, séparez-les par des virgules (ex: Canva, Hootsuite, Buffer)</li>
              </ul>
              <div className="mt-2 text-xs text-white/70 italic">Vos modifications seront sauvegardées dans le format approprié pour être affichées correctement dans le tableau.</div>
            </div>
            <button className="ml-auto bg-white/10 hover:bg-white/20 transition-colors p-1.5 rounded-full" title="Masquer les conseils">
              <X className="w-4 h-4" />
            </button>
          </div>
          {children}
        </div>
        
        <div className="p-5 border-t border-white/10 bg-black/20 flex justify-between items-center">
          <div className="flex items-center text-white/70 text-sm">
            <HelpCircle className="w-4 h-4 mr-2" />
            <span>Utilisez la touche <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">Tab</kbd> pour naviguer entre les champs</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button 
              onClick={onSave}
              disabled={isSaving}
              className={`px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''} shadow-lg shadow-blue-500/20`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour une ligne de diagnostic
const DiagnosticRow = ({ result, startup, fetchResults }: { 
  result: WorkspaceResult, 
  startup: Startup | undefined, 
  fetchResults: () => void 
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editedProblemeGlobal, setEditedProblemeGlobal] = React.useState('');
  const [editedProblemeReformule, setEditedProblemeReformule] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('problemeGlobal');
  
  // Extraire les problèmes global et reformulé
  const extractDiagnosticInfo = (response: string) => {
    // Fonction pour extraire le contenu d'une section spécifique
    const extractSectionContent = (text: string, sectionTitle: string, nextSectionTitle: string) => {
      const regex = new RegExp(`${sectionTitle}\\s*:\\s*([\\s\\S]*?)(?=\\s*${nextSectionTitle}\\s*:|$)`, 'i');
      const match = text.match(regex);
      return match && match[1] ? match[1].trim() : "";
    };

    // Fonction pour détecter les sections numérotées
    const extractNumberedSection = (text: string, sectionNumber: string, sectionName: string) => {
      const regex = new RegExp(`${sectionNumber}\\s*\\.\\s*${sectionName}\\s*:?\\s*([\\s\\S]*?)(?=\\s*\\d+\\s*\\.\\s*|$)`, 'i');
      const match = text.match(regex);
      return match && match[1] ? match[1].trim() : "";
    };

    // Nettoyer les résultats et formater correctement le markdown
    const formatMarkdown = (text: string) => {
      if (!text || text.trim() === '') return "";
      
      // Nettoyer le texte
      let formattedText = text.trim();
      
      // Supprimer les numéros de section et les caractères spéciaux à la fin
      formattedText = formattedText.replace(/\s*\d+\s*\.\s*$/, '');
      
      // Nettoyer les astérisques isolés au début et à la fin
      formattedText = formattedText.replace(/^\s*\*\s*/, '');
      formattedText = formattedText.replace(/\s*\*\s*$/, '');
      
      // Remplacer les ** (gras) par des spans avec classe de style
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
      
      // Remplacer les * (italique) par des spans avec classe de style
      // Mais seulement s'il y a du texte entre les astérisques
      formattedText = formattedText.replace(/\*([^*\s][^*]*[^*\s])\*/g, '<span class="italic">$1</span>');
      
      // Remplacer les astérisques isolés restants par du texte normal
      formattedText = formattedText.replace(/\*/g, '');
      
      // Conserver les sauts de ligne et ajouter un espacement
      formattedText = formattedText.replace(/\n/g, '<br />');
      
      return formattedText;
    };

    // Stratégie 1: Extraction par titres de section standard
    let problemeGlobal = extractSectionContent(response, "PROBLÈME GLOBAL", "PROBLÈME REFORMULÉ");
    let problemeReformule = extractSectionContent(response, "PROBLÈME REFORMULÉ", "ANALYSE DU MARCHÉ");

    // Stratégie 2: Si la première stratégie échoue, essayer avec les sections numérotées
    if (!problemeGlobal) {
      problemeGlobal = extractNumberedSection(response, "1", "Problème global");
    }

    if (!problemeReformule) {
      problemeReformule = extractNumberedSection(response, "2", "Problème reformulé");
    }

    // Stratégie 3: Recherche de motifs spécifiques dans le texte
    if (!problemeReformule && response.includes("Problème reformulé :")) {
      const reformuleIndex = response.indexOf("Problème reformulé :");
      const analyseIndex = response.indexOf("Analyse", reformuleIndex);
      
      if (reformuleIndex !== -1) {
        const endIndex = analyseIndex !== -1 ? analyseIndex : response.length;
        problemeReformule = response.substring(reformuleIndex + "Problème reformulé :".length, endIndex).trim();
      }
    }

    // Vérifier si le problème global contient le problème reformulé
    if (problemeGlobal && problemeReformule) {
      // Si le problème global contient le problème reformulé complet, le supprimer
      const reformuleInGlobal = problemeGlobal.indexOf(problemeReformule);
      if (reformuleInGlobal !== -1) {
        problemeGlobal = problemeGlobal.substring(0, reformuleInGlobal).trim();
      }
      
      // Vérifier si le problème global contient "Problème reformulé:"
      const reformuleMarker = problemeGlobal.indexOf("Problème reformulé");
      if (reformuleMarker !== -1) {
        problemeGlobal = problemeGlobal.substring(0, reformuleMarker).trim();
      }
    }

    // Traitement spécifique pour le problème reformulé
    if (problemeReformule) {
      // Vérifier si le problème reformulé contient "Analyse détaillée" ou d'autres marqueurs de section
      const analyseMarker = problemeReformule.indexOf("Analyse détaillée");
      if (analyseMarker !== -1) {
        problemeReformule = problemeReformule.substring(0, analyseMarker).trim();
      }
      
      // Vérifier si le problème reformulé contient "Voici une analyse"
      const voiciMarker = problemeReformule.indexOf("Voici une analyse");
      if (voiciMarker !== -1) {
        problemeReformule = problemeReformule.substring(0, voiciMarker).trim();
      }
      
      // Vérifier si le problème reformulé contient "1. Problème global"
      const problemeGlobalMarker = problemeReformule.indexOf("1. Problème global");
      if (problemeGlobalMarker !== -1) {
        problemeReformule = problemeReformule.substring(0, problemeGlobalMarker).trim();
      }
      
      // Vérifier si le problème reformulé contient une répétition de "Problème reformulé:"
      const problemeReformuleMarker = problemeReformule.indexOf("Problème reformulé:");
      if (problemeReformuleMarker !== -1) {
        // Prendre la partie après "Problème reformulé:" car c'est généralement la version la plus propre
        problemeReformule = problemeReformule.substring(problemeReformuleMarker + "Problème reformulé:".length).trim();
      }
      
      // Vérifier s'il y a une répétition du même texte (doublons)
      if (problemeReformule.length > 50) {
        const firstHalf = problemeReformule.substring(0, Math.floor(problemeReformule.length / 2));
        const secondHalf = problemeReformule.substring(Math.floor(problemeReformule.length / 2));
        
        // Si la première moitié est similaire à la seconde, ne garder que la première
        if (firstHalf.trim() === secondHalf.trim() || 
            secondHalf.includes(firstHalf) || 
            firstHalf.includes(secondHalf)) {
          problemeReformule = firstHalf.trim();
        }
      }
      
      // Supprimer les numéros de section isolés à la fin du texte (comme "2." à la fin)
      problemeReformule = problemeReformule.replace(/\s*\d+\s*\.\s*$/, '');
      
      // Supprimer les numéros de section suivis d'un espace à la fin
      problemeReformule = problemeReformule.replace(/\s+\d+\s*\.\s*$/, '');
    }

    // Même traitement pour le problème global
    if (problemeGlobal) {
      problemeGlobal = problemeGlobal.replace(/\s*\d+\s*\.\s*$/, '');
      problemeGlobal = problemeGlobal.replace(/\s+\d+\s*\.\s*$/, '');
    }

    // Formater les résultats
    return {
      problemeGlobal: formatMarkdown(problemeGlobal),
      problemeReformule: formatMarkdown(problemeReformule)
    };
  };
  
  const { problemeGlobal, problemeReformule } = extractDiagnosticInfo(result.response);
  
  // Fonction pour sauvegarder les modifications
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // Créer une copie de la réponse pour la modifier
      let updatedResponse = result.response;
      
      // Déterminer si la réponse utilise des titres standard ou numérotés
      const usesNumberedFormat = updatedResponse.match(/\d+\s*\.\s*Problème/i);
      
      if (usesNumberedFormat) {
        // Remplacer la section numérotée du problème global
        const globalRegex = /1\s*\.\s*Problème global\s*:?[\s\S]*?(?=2\s*\.\s*Problème reformulé|$)/i;
        updatedResponse = updatedResponse.replace(
          globalRegex,
          `1. Problème global : ${editedProblemeGlobal}\n\n`
        );
        
        // Remplacer la section numérotée du problème reformulé
        const reformuleRegex = /2\s*\.\s*Problème reformulé\s*:?[\s\S]*?(?=3\s*\.|ANALYSE|$)/i;
        updatedResponse = updatedResponse.replace(
          reformuleRegex,
          `2. Problème reformulé : ${editedProblemeReformule}\n\n`
        );
      } else {
        // Utiliser les titres standard
        updatedResponse = updatedResponse.replace(
          /PROBLÈME GLOBAL\s*:\s*[\s\S]*?(?=\s*PROBLÈME REFORMULÉ\s*:|$)/i,
          `PROBLÈME GLOBAL: ${editedProblemeGlobal}\n\n`
        );
        
        updatedResponse = updatedResponse.replace(
          /PROBLÈME REFORMULÉ\s*:\s*[\s\S]*?(?=\s*ANALYSE DU MARCHÉ\s*:|$)/i,
          `PROBLÈME REFORMULÉ: ${editedProblemeReformule}\n\n`
        );
      }
      
      // Sauvegarder dans la base de données
      const { error } = await supabase
        .from('workspace_results')
        .update({ response: updatedResponse })
        .eq('id', result.id);
        
      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return;
      }
      
      // Rafraîchir les résultats
      fetchResults();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Initialiser les valeurs d'édition à l'ouverture du modal
  const openModal = () => {
    setEditedProblemeGlobal(problemeGlobal ? problemeGlobal.replace(/<[^>]*>/g, '') : '');
    setEditedProblemeReformule(problemeReformule ? problemeReformule.replace(/<[^>]*>/g, '') : '');
    setActiveTab('problemeGlobal');
    setIsModalOpen(true);
  };
  
  // Prévisualisation formatée
  const renderPreview = (text: string) => {
    return {
      __html: text
        .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
        .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')
        .replace(/\n/g, '<br />')
    };
  };
  
  const date = new Date(result.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Calculer les compteurs de caractères
  const globalChars = editedProblemeGlobal.length;
  const reformuleChars = editedProblemeReformule.length;
  
  return (
    <>
      <tr className="border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-[0.02]">
        <td className="px-4 py-3 text-sm">
          <div className="font-medium">{startup?.name || 'Startup inconnue'}</div>
          <div className="text-xs text-white text-opacity-60">{startup?.sector || 'Secteur inconnu'}</div>
        </td>
        <td className="px-4 py-3 text-sm">
          <div className="max-w-xs line-clamp-3 hover:line-clamp-none cursor-pointer transition-all duration-200 hover:bg-white/5 hover:p-2 hover:rounded hover:shadow-md"
               dangerouslySetInnerHTML={{ __html: startup?.needs || "Non spécifié" }}></div>
        </td>
        <td className="px-4 py-3 text-sm">
          <div 
            className="max-w-xs line-clamp-3 hover:line-clamp-none cursor-pointer transition-all duration-200 hover:bg-white/5 hover:p-2 hover:rounded hover:shadow-md"
            dangerouslySetInnerHTML={{ __html: problemeGlobal || "Cliquez pour ajouter" }}
          ></div>
        </td>
        <td className="px-4 py-3 text-sm">
          <div 
            className="max-w-xs line-clamp-3 hover:line-clamp-none cursor-pointer transition-all duration-200 hover:bg-white/5 hover:p-2 hover:rounded hover:shadow-md"
            dangerouslySetInnerHTML={{ __html: problemeReformule || "Cliquez pour ajouter" }}
          ></div>
        </td>
        <td className="px-4 py-3 text-sm text-white text-opacity-60">{date}</td>
        <td className="px-4 py-3">
          <button 
            onClick={openModal}
            className="px-3 py-1.5 bg-white bg-opacity-[0.05] hover:bg-opacity-10 rounded-lg text-sm font-medium transition-all"
          >
            Modifier
          </button>
        </td>
      </tr>
      
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modifier le diagnostic"
        onSave={saveChanges}
        isSaving={isSaving}
      >
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('problemeGlobal')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'problemeGlobal' 
                ? 'text-white border-b-2 border-blue-500 bg-white/5' 
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            Problème global
          </button>
          <button
            onClick={() => setActiveTab('problemeReformule')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'problemeReformule' 
                ? 'text-white border-b-2 border-blue-500 bg-white/5' 
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            Problème reformulé
          </button>
        </div>
        
        <div className={activeTab === 'problemeGlobal' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Problème global:
                <span className="float-right text-xs text-white/60">
                  {globalChars} caractères
                </span>
              </label>
              <textarea
                value={editedProblemeGlobal}
                onChange={(e) => setEditedProblemeGlobal(e.target.value)}
                className="w-full h-60 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                placeholder="Décrivez le problème global..."
              />
              <div className="text-xs text-white/60 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Une description précise du problème principal de la startup
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/70 font-medium">Prévisualisation</div>
                <div className="text-xs text-white/50 italic">Format d'affichage final</div>
              </div>
              <div 
                className="prose prose-invert prose-sm max-w-none p-3 bg-black/30 rounded min-h-[180px] border border-white/5 text-white/90"
                dangerouslySetInnerHTML={renderPreview(editedProblemeGlobal)}
              />
            </div>
          </div>
        </div>
        
        <div className={activeTab === 'problemeReformule' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Problème reformulé:
                <span className="float-right text-xs text-white/60">
                  {reformuleChars} caractères
                </span>
              </label>
              <textarea
                value={editedProblemeReformule}
                onChange={(e) => setEditedProblemeReformule(e.target.value)}
                className="w-full h-60 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                placeholder="Reformulez le problème..."
              />
              <div className="text-xs text-white/60 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Une reformulation du problème adaptée à l'analyse
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/70 font-medium">Prévisualisation</div>
                <div className="text-xs text-white/50 italic">Format d'affichage final</div>
              </div>
              <div 
                className="prose prose-invert prose-sm max-w-none p-3 bg-black/30 rounded min-h-[180px] border border-white/5 text-white/90"
                dangerouslySetInnerHTML={renderPreview(editedProblemeReformule)}
              />
            </div>
          </div>
        </div>
      </EditModal>
    </>
  );
};

// Composant pour une ligne de solutions
const SolutionsRow = ({ result, startup, fetchResults }: { 
  result: WorkspaceResult, 
  startup: Startup | undefined, 
  fetchResults: () => void 
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editedSolutions, setEditedSolutions] = React.useState('');
  const [editedPlan, setEditedPlan] = React.useState('');
  const [editedReseaux, setEditedReseaux] = React.useState('');
  const [editedOutils, setEditedOutils] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('solutions');
  
  // Extraire les solutions, le plan d'action, les réseaux et les outils
  const extractSolutionsInfo = (response: string) => {
    // Utiliser des expressions régulières plus précises pour capturer les sections
    const solutionsRegex = /SOLUTIONS PRIORITAIRES\s*:\s*([\s\S]*?)(?=\s*PLAN D'ACTION\s*:|$)/i;
    const planRegex = /PLAN D'ACTION\s*:\s*([\s\S]*?)(?=\s*RÉSEAUX RECOMMANDÉS\s*:|RECOMMANDATIONS STRATÉGIQUES\s*:|$)/i;
    const reseauxRegex = /RÉSEAUX RECOMMANDÉS\s*:\s*([\s\S]*?)(?=\s*OUTILS RECOMMANDÉS\s*:|$)/i;
    const outilsRegex = /OUTILS RECOMMANDÉS\s*:\s*([\s\S]*?)(?=\s*RECOMMANDATIONS STRATÉGIQUES\s*:|$)/i;
    
    // Extraire les sections avec les nouvelles regex
    const solutionsMatch = response.match(solutionsRegex);
    const planMatch = response.match(planRegex);
    const reseauxMatch = response.match(reseauxRegex);
    const outilsMatch = response.match(outilsRegex);
    
    // Nettoyer les résultats et formater correctement le markdown
    const formatMarkdown = (text: string) => {
      if (!text || text.trim() === '') return "";
      
      // Nettoyer le texte
      let formattedText = text.trim();
      
      // Supprimer les numéros de section et les caractères spéciaux à la fin
      formattedText = formattedText.replace(/\s*\d+\s*\.\s*$/, '');
      
      // Nettoyer les astérisques isolés au début et à la fin
      formattedText = formattedText.replace(/^\s*\*\s*/, '');
      formattedText = formattedText.replace(/\s*\*\s*$/, '');
      
      // Remplacer les ** (gras) par des spans avec classe de style
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
      
      // Remplacer les * (italique) par des spans avec classe de style
      // Mais seulement s'il y a du texte entre les astérisques
      formattedText = formattedText.replace(/\*([^*\s][^*]*[^*\s])\*/g, '<span class="italic">$1</span>');
      
      // Remplacer les astérisques isolés restants par du texte normal
      formattedText = formattedText.replace(/\*/g, '');
      
      // Conserver les sauts de ligne et ajouter un espacement
      formattedText = formattedText.replace(/\n/g, '<br />');
      
      return formattedText;
    };
    
    // Formater le texte des réseaux et outils pour le rendu des icônes
    const formatReseauxOutils = (text: string) => {
      if (!text || text.trim() === '') return "";
      
      // Nettoyer le texte
      let formattedText = text.trim();
      
      // Supprimer les numéros de section et les caractères spéciaux à la fin
      formattedText = formattedText.replace(/\s*\d+\s*\.\s*$/, '');
      
      // Nettoyer les astérisques isolés au début et à la fin
      formattedText = formattedText.replace(/^\s*\*\s*/, '');
      formattedText = formattedText.replace(/\s*\*\s*$/, '');
      
      // Remplacer les ** (gras) par du texte normal
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '$1');
      
      // Remplacer les * (italique) par du texte normal
      formattedText = formattedText.replace(/\*([^*]+)\*/g, '$1');
      
      // Remplacer les astérisques isolés restants par du texte normal
      formattedText = formattedText.replace(/\*/g, '');
      
      return formattedText;
    };
    
    return {
      solutions: solutionsMatch && solutionsMatch[1] && solutionsMatch[1].trim() !== '' 
        ? formatMarkdown(solutionsMatch[1]) 
        : "",
      plan: planMatch && planMatch[1] && planMatch[1].trim() !== '' 
        ? formatMarkdown(planMatch[1]) 
        : "",
      reseaux: reseauxMatch && reseauxMatch[1] && reseauxMatch[1].trim() !== '' 
        ? formatReseauxOutils(reseauxMatch[1]) 
        : "",
      outils: outilsMatch && outilsMatch[1] && outilsMatch[1].trim() !== '' 
        ? formatReseauxOutils(outilsMatch[1]) 
        : ""
    };
  };
  
  const { solutions, plan, reseaux, outils } = extractSolutionsInfo(result.response);
  
  // Fonction pour sauvegarder les modifications
  const saveChanges = async () => {
    setIsSaving(true);
    try {
      // Créer une copie de la réponse pour la modifier
      let updatedResponse = result.response;
      
      // Utiliser des expressions régulières pour remplacer les sections spécifiques
      updatedResponse = updatedResponse.replace(
        /SOLUTIONS PRIORITAIRES\s*:\s*[\s\S]*?(?=\s*PLAN D'ACTION\s*:|$)/i,
        `SOLUTIONS PRIORITAIRES: ${editedSolutions}\n\n`
      );
      
      updatedResponse = updatedResponse.replace(
        /PLAN D'ACTION\s*:\s*[\s\S]*?(?=\s*RÉSEAUX RECOMMANDÉS\s*:|RECOMMANDATIONS STRATÉGIQUES\s*:|$)/i,
        `PLAN D'ACTION: ${editedPlan}\n\n`
      );
      
      // Vérifier si les sections RÉSEAUX RECOMMANDÉS et OUTILS RECOMMANDÉS existent déjà
      const hasReseaux = /RÉSEAUX RECOMMANDÉS\s*:/i.test(updatedResponse);
      const hasOutils = /OUTILS RECOMMANDÉS\s*:/i.test(updatedResponse);
      
      if (hasReseaux) {
        updatedResponse = updatedResponse.replace(
          /RÉSEAUX RECOMMANDÉS\s*:\s*[\s\S]*?(?=\s*OUTILS RECOMMANDÉS\s*:|RECOMMANDATIONS STRATÉGIQUES\s*:|$)/i,
          `RÉSEAUX RECOMMANDÉS: ${editedReseaux}\n\n`
        );
      } else {
        // Ajouter la section après PLAN D'ACTION
        const planActionIndex = updatedResponse.indexOf("PLAN D'ACTION:");
        if (planActionIndex !== -1) {
          const afterPlanAction = updatedResponse.indexOf("\n\n", planActionIndex);
          if (afterPlanAction !== -1) {
            updatedResponse = updatedResponse.substring(0, afterPlanAction + 2) + 
                             `RÉSEAUX RECOMMANDÉS: ${editedReseaux}\n\n` + 
                             updatedResponse.substring(afterPlanAction + 2);
          }
        }
      }
      
      if (hasOutils) {
        updatedResponse = updatedResponse.replace(
          /OUTILS RECOMMANDÉS\s*:\s*[\s\S]*?(?=\s*RECOMMANDATIONS STRATÉGIQUES\s*:|$)/i,
          `OUTILS RECOMMANDÉS: ${editedOutils}\n\n`
        );
      } else {
        // Ajouter la section après RÉSEAUX RECOMMANDÉS ou PLAN D'ACTION
        const reseauxIndex = updatedResponse.indexOf("RÉSEAUX RECOMMANDÉS:");
        if (reseauxIndex !== -1) {
          const afterReseaux = updatedResponse.indexOf("\n\n", reseauxIndex);
          if (afterReseaux !== -1) {
            updatedResponse = updatedResponse.substring(0, afterReseaux + 2) + 
                             `OUTILS RECOMMANDÉS: ${editedOutils}\n\n` + 
                             updatedResponse.substring(afterReseaux + 2);
          }
        } else {
          const planActionIndex = updatedResponse.indexOf("PLAN D'ACTION:");
          if (planActionIndex !== -1) {
            const afterPlanAction = updatedResponse.indexOf("\n\n", planActionIndex);
            if (afterPlanAction !== -1) {
              updatedResponse = updatedResponse.substring(0, afterPlanAction + 2) + 
                               `RÉSEAUX RECOMMANDÉS: ${editedReseaux}\n\n` + 
                               `OUTILS RECOMMANDÉS: ${editedOutils}\n\n` + 
                               updatedResponse.substring(afterPlanAction + 2);
            }
          }
        }
      }
      
      // Sauvegarder dans la base de données
      const { error } = await supabase
        .from('workspace_results')
        .update({ response: updatedResponse })
        .eq('id', result.id);
        
      if (error) {
        console.error('Erreur lors de la mise à jour:', error);
        return;
      }
      
      // Rafraîchir les résultats
      fetchResults();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Initialiser les valeurs d'édition à l'ouverture du modal
  const openModal = () => {
    setEditedSolutions(solutions ? solutions.replace(/<[^>]*>/g, '') : '');
    setEditedPlan(plan ? plan.replace(/<[^>]*>/g, '') : '');
    setEditedReseaux(reseaux ? reseaux.replace(/<[^>]*>/g, '') : '');
    setEditedOutils(outils ? outils.replace(/<[^>]*>/g, '') : '');
    setActiveTab('solutions');
    setIsModalOpen(true);
  };
  
  // Prévisualisation formatée
  const renderPreview = (text: string) => {
    return {
      __html: text
        .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
        .replace(/\*([^*]+)\*/g, '<span class="italic">$1</span>')
        .replace(/\n/g, '<br />')
    };
  };
  
  // Rendu des icônes de réseaux sociaux en direct pour la prévisualisation
  const liveReseauxPreview = (reseauxText: string) => {
    if (!reseauxText) return null;
    
    const reseauxList = reseauxText.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {reseauxList.map((reseau, index) => {
          let icon = null;
          let name = reseau;
          
          if (reseau.includes("instagram")) {
            icon = <Instagram className="w-6 h-6 text-pink-500" />;
            name = "Instagram";
          } else if (reseau.includes("facebook")) {
            icon = <Facebook className="w-6 h-6 text-blue-500" />;
            name = "Facebook";
          } else if (reseau.includes("twitter") || reseau.includes("x.com")) {
            icon = <Twitter className="w-6 h-6 text-sky-400" />;
            name = "Twitter/X";
          } else if (reseau.includes("linkedin")) {
            icon = <Linkedin className="w-6 h-6 text-blue-600" />;
            name = "LinkedIn";
          } else if (reseau.includes("youtube")) {
            icon = <Youtube className="w-6 h-6 text-red-500" />;
            name = "YouTube";
          } else if (reseau.includes("tiktok")) {
            icon = <Music className="w-6 h-6 text-violet-500" />;
            name = "TikTok";
          } else if (reseau.includes("site") || reseau.includes("web")) {
            icon = <Globe className="w-6 h-6 text-green-500" />;
            name = "Site Web";
          } else if (reseau.includes("mail") || reseau.includes("email")) {
            icon = <Mail className="w-6 h-6 text-amber-500" />;
            name = "Email";
          } else if (reseau.includes("chat") || reseau.includes("message")) {
            icon = <MessageSquare className="w-6 h-6 text-emerald-500" />;
            name = "Messagerie";
          } else {
            icon = <Globe className="w-6 h-6 text-gray-400" />;
          }
          
          return (
            <div key={index} className="flex flex-col items-center bg-white/5 p-2 rounded-lg">
              {icon}
              <span className="text-xs mt-1">{name}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Rendu des icônes d'outils en direct pour la prévisualisation 
  const liveOutilsPreview = (outilsText: string) => {
    if (!outilsText) return null;
    
    const outilsList = outilsText.split(',').map(o => o.trim().toLowerCase()).filter(Boolean);
    
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {outilsList.map((outil, index) => {
          let icon = null;
          let name = outil.charAt(0).toUpperCase() + outil.slice(1);
          
          if (outil.includes("canva")) {
            icon = <PenTool className="w-6 h-6 text-blue-500" />;
            name = "Canva";
          } else if (outil.includes("analytics") || outil.includes("statistique") || outil.includes("google")) {
            icon = <BarChart className="w-6 h-6 text-yellow-500" />;
            name = "Analytics";
          } else if (outil.includes("planification") || outil.includes("calendar") || outil.includes("hootsuite") || outil.includes("buffer")) {
            icon = <Calendar className="w-6 h-6 text-green-500" />;
            name = outil.charAt(0).toUpperCase() + outil.slice(1);
          } else if (outil.includes("photo") || outil.includes("image")) {
            icon = <Camera className="w-6 h-6 text-pink-500" />;
            name = outil.charAt(0).toUpperCase() + outil.slice(1);
          } else if (outil.includes("video") || outil.includes("montage")) {
            icon = <Video className="w-6 h-6 text-red-500" />;
            name = outil.charAt(0).toUpperCase() + outil.slice(1);
          } else if (outil.includes("mobile") || outil.includes("app")) {
            icon = <Smartphone className="w-6 h-6 text-indigo-500" />;
            name = outil.charAt(0).toUpperCase() + outil.slice(1);
          } else if (outil.includes("podcast") || outil.includes("audio")) {
            icon = <Headphones className="w-6 h-6 text-yellow-500" />;
            name = outil.charAt(0).toUpperCase() + outil.slice(1);
          } else {
            icon = <Settings className="w-6 h-6 text-gray-400" />;
          }
          
          return (
            <div key={index} className="flex flex-col items-center bg-white/5 p-2 rounded-lg">
              {icon}
              <span className="text-xs mt-1">{name}</span>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Calculer les compteurs de caractères
  const solutionsChars = editedSolutions.length;
  const planChars = editedPlan.length;
  const reseauxChars = editedReseaux.length;
  const outilsChars = editedOutils.length;
  
  const date = new Date(result.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <>
      <tr className="border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-[0.02]">
        <td className="px-4 py-3 text-sm">
          <div className="font-medium">{startup?.name || 'Startup inconnue'}</div>
          <div className="text-xs text-white text-opacity-60">{startup?.sector || 'Secteur inconnu'}</div>
        </td>
        <td className="px-4 py-3 text-sm">
          <div className="max-w-xs line-clamp-3 hover:line-clamp-none cursor-pointer transition-all duration-200 hover:bg-white/5 hover:p-2 hover:rounded hover:shadow-md"
               dangerouslySetInnerHTML={{ __html: solutions || "Non spécifié" }}></div>
        </td>
        <td className="px-4 py-3 text-sm">
          <div className="max-w-xs line-clamp-3 hover:line-clamp-none cursor-pointer transition-all duration-200 hover:bg-white/5 hover:p-2 hover:rounded hover:shadow-md"
              dangerouslySetInnerHTML={{ __html: plan || "Non spécifié" }}></div>
        </td>
        <td className="px-4 py-3 text-sm">
          {liveReseauxPreview(reseaux)}
        </td>
        <td className="px-4 py-3 text-sm">
          {liveOutilsPreview(outils)}
        </td>
        <td className="px-4 py-3 text-sm text-white text-opacity-60">{date}</td>
        <td className="px-4 py-3">
          <button 
            onClick={openModal}
            className="px-3 py-1.5 bg-white bg-opacity-[0.05] hover:bg-opacity-10 rounded-lg text-sm font-medium transition-all"
          >
            Modifier
          </button>
        </td>
      </tr>
      
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modifier les solutions"
        onSave={saveChanges}
        isSaving={isSaving}
      >
        <div className="flex flex-wrap border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('solutions')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'solutions' 
                ? 'text-white border-b-2 border-purple-500 bg-white/5' 
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            Solutions
          </button>
          <button
            onClick={() => setActiveTab('plan')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'plan' 
                ? 'text-white border-b-2 border-blue-500 bg-white/5' 
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            Plan d'action
          </button>
          <button
            onClick={() => setActiveTab('reseaux')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reseaux' 
                ? 'text-white border-b-2 border-pink-500 bg-white/5' 
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            Réseaux
          </button>
          <button
            onClick={() => setActiveTab('outils')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'outils' 
                ? 'text-white border-b-2 border-green-500 bg-white/5' 
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            Outils
          </button>
        </div>
        
        {/* Solutions Tab */}
        <div className={activeTab === 'solutions' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Solutions prioritaires:
                <span className="float-right text-xs text-white/60">
                  {solutionsChars} caractères
                </span>
              </label>
              <textarea
                value={editedSolutions}
                onChange={(e) => setEditedSolutions(e.target.value)}
                className="w-full h-60 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 transition-all text-sm resize-none"
                placeholder="Listez les solutions prioritaires..."
              />
              <div className="text-xs text-white/60 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Les solutions principales pour résoudre les problèmes identifiés
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/70 font-medium">Prévisualisation</div>
                <div className="text-xs text-white/50 italic">Format d'affichage final</div>
              </div>
              <div 
                className="prose prose-invert prose-sm max-w-none p-3 bg-black/30 rounded min-h-[180px] border border-white/5 text-white/90"
                dangerouslySetInnerHTML={renderPreview(editedSolutions)}
              />
            </div>
          </div>
        </div>
        
        {/* Plan d'action Tab */}
        <div className={activeTab === 'plan' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Plan d'action:
                <span className="float-right text-xs text-white/60">
                  {planChars} caractères
                </span>
              </label>
              <textarea
                value={editedPlan}
                onChange={(e) => setEditedPlan(e.target.value)}
                className="w-full h-60 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm resize-none"
                placeholder="Décrivez le plan d'action..."
              />
              <div className="text-xs text-white/60 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                Les étapes concrètes à suivre pour mettre en œuvre les solutions
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/70 font-medium">Prévisualisation</div>
                <div className="text-xs text-white/50 italic">Format d'affichage final</div>
              </div>
              <div 
                className="prose prose-invert prose-sm max-w-none p-3 bg-black/30 rounded min-h-[180px] border border-white/5 text-white/90"
                dangerouslySetInnerHTML={renderPreview(editedPlan)}
              />
            </div>
          </div>
        </div>
        
        {/* Réseaux Tab */}
        <div className={activeTab === 'reseaux' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Réseaux recommandés:
                <span className="float-right text-xs text-white/60">
                  {reseauxChars} caractères
                </span>
              </label>
              <textarea
                value={editedReseaux}
                onChange={(e) => setEditedReseaux(e.target.value)}
                className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all text-sm resize-none"
                placeholder="Instagram, Facebook, LinkedIn, Twitter..."
              />
              <div className="text-xs text-white/60 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-pink-400" />
                Listez les réseaux sociaux recommandés séparés par des virgules
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/70 font-medium">Prévisualisation</div>
                <div className="text-xs text-white/50 italic">Format d'affichage final</div>
              </div>
              <div className="p-3 bg-black/30 rounded min-h-[180px] border border-white/5 text-white/90">
                {liveReseauxPreview(editedReseaux)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Outils Tab */}
        <div className={activeTab === 'outils' ? 'block' : 'hidden'}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">
                Outils recommandés:
                <span className="float-right text-xs text-white/60">
                  {outilsChars} caractères
                </span>
              </label>
              <textarea
                value={editedOutils}
                onChange={(e) => setEditedOutils(e.target.value)}
                className="w-full h-40 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-all text-sm resize-none"
                placeholder="Canva, Google Analytics, Buffer..."
              />
              <div className="text-xs text-white/60 flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-green-400" />
                Listez les outils recommandés séparés par des virgules
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-white/70 font-medium">Prévisualisation</div>
                <div className="text-xs text-white/50 italic">Format d'affichage final</div>
              </div>
              <div className="p-3 bg-black/30 rounded min-h-[180px] border border-white/5 text-white/90">
                {liveOutilsPreview(editedOutils)}
              </div>
            </div>
          </div>
        </div>
      </EditModal>
    </>
  );
};

export function WorkspaceResults() {
  const { startups, fetchStartups, loading: startupsLoading } = useStartupStore();
  const [results, setResults] = React.useState<WorkspaceResult[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [phaseFilter, setPhaseFilter] = React.useState<'all' | 'diagnostic' | 'solutions'>('all');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');

  const fetchResults = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspace_results')
        .select('*')
        .order('created_at', { ascending: sortOrder === 'asc' });

      if (error) {
        console.error('Error fetching results:', error);
        return;
      }

      setResults(data || []);
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  }, [sortOrder]);

  React.useEffect(() => {
    fetchStartups();
    fetchResults();
  }, [fetchStartups, fetchResults]);

  const filteredResults = React.useMemo(() => {
    return results.filter(result => {
      // Filtre par phase
      if (phaseFilter !== 'all' && result.phase !== phaseFilter) {
        return false;
      }

      // Filtre par recherche
      if (searchTerm) {
        const startup = startups.find(s => s.id === result.startup_id);
        const searchLower = searchTerm.toLowerCase();
        return (
          startup?.name.toLowerCase().includes(searchLower) ||
          startup?.sector.toLowerCase().includes(searchLower) ||
          result.response.toLowerCase().includes(searchLower) ||
          result.summary?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    });
  }, [results, phaseFilter, searchTerm, startups]);

  // Vérifier si les données sont en cours de chargement
  const isLoading = loading || startupsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-blue-400 animate-pulse">Chargement des résultats...</p>
        </div>
      </div>
    );
  }

  // Vérifier si les données sont chargées mais vides
  const noResults = results.length === 0;
  const noFilteredResults = filteredResults.length === 0;

  return (
    <div className="text-white">
      {/* Header avec titre et breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center text-white text-opacity-60 text-sm mb-2">
          <span className="hover:text-opacity-100 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-white">Résultats des sessions</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white bg-clip-text text-transparent">Résultats</h1>
            <div className="bg-white bg-opacity-10 px-2.5 py-1 rounded-full text-xs font-medium">
              {filteredResults.length} résultats
            </div>
          </div>
          
          <button
            onClick={fetchResults}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-white hover:bg-opacity-5 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

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
              placeholder="Rechercher par startup, secteur, contenu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          {/* Filtre par phase */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white text-opacity-60" />
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value as 'all' | 'diagnostic' | 'solutions')}
              className="bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">Toutes les phases</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="solutions">Solutions</option>
            </select>
          </div>
          
          {/* Tri par date */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-white text-opacity-60" />
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc');
                setTimeout(fetchResults, 100);
              }}
              className="bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="desc">Plus récent d'abord</option>
              <option value="asc">Plus ancien d'abord</option>
            </select>
          </div>
          
          <Link
            to="/workspace"
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 md:ml-auto"
          >
            <span className="font-medium">Retour aux sessions</span>
          </Link>
        </div>
      </div>

      {noFilteredResults ? (
        <div className="flex flex-col items-center justify-center py-16 text-white text-opacity-40">
          <FileText className="w-16 h-16 mb-4 opacity-30" />
          <h3 className="text-xl font-medium mb-2">
            {noResults ? "Aucun résultat trouvé" : "Aucun résultat ne correspond à votre recherche"}
          </h3>
          <p className="text-sm max-w-md text-center mb-6">
            {noResults 
              ? "Aucun résultat n'a été enregistré. Créez une session pour commencer."
              : "Essayez de modifier vos critères de recherche ou de filtrage."}
          </p>
          <Link
            to="/workspace"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <span>Créer une session</span>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {/* Tableau des résultats de diagnostic */}
          {filteredResults.filter(r => r.phase === 'diagnostic').length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Résultats de diagnostic
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white bg-opacity-[0.03] text-left">
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Startup</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Besoins</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Problème global</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Problème reformulé</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults
                    .filter(result => result.phase === 'diagnostic')
                    .map(result => {
                      const startup = startups.find(s => s.id === result.startup_id);
                      return (
                        <DiagnosticRow 
                          key={result.id} 
                          result={result} 
                          startup={startup} 
                          fetchResults={fetchResults} 
                        />
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tableau des résultats de solutions */}
          {filteredResults.filter(r => r.phase === 'solutions').length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-400" />
                Solutions et recommandations
              </h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white bg-opacity-[0.03] text-left">
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Startup</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Solutions prioritaires</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Plan d'action</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Réseaux recommandés</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Outils recommandés</th>
                    <th className="px-4 py-3 text-sm font-medium text-white text-opacity-60 border-b border-white border-opacity-10">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults
                    .filter(result => result.phase === 'solutions')
                    .map(result => {
                      const startup = startups.find(s => s.id === result.startup_id);
                      return (
                        <SolutionsRow 
                          key={result.id} 
                          result={result} 
                          startup={startup} 
                          fetchResults={fetchResults} 
                        />
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 