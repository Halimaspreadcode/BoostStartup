import React from 'react';
import { useStartupStore } from '../store/startupStore';
import { Calendar, FileText, ChevronDown, Clock, Table } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  action: string;
  description: string;
}

interface ActionResultsProps {
  startupId: string;
}

export function ActionResults({ startupId }: ActionResultsProps) {
  const startup = useStartupStore(state => state.startups.find(s => s.id === startupId));
  const [activeTab, setActiveTab] = React.useState<string | null>(null);
  const [expandedEvents, setExpandedEvents] = React.useState<Record<string, boolean>>({});

  // Group timeline events by action type
  const actionGroups = React.useMemo(() => {
    if (!startup || !startup.timeline || startup.timeline.length === 0) {
      return {};
    }
    
    return startup.timeline.reduce((acc, event) => {
      // Ignorer les événements sans action, avec action vide ou avec action "Diagnostique"
      if (!event.action || event.action.trim() === '' || event.action.trim() === 'Diagnostique') {
        return acc;
      }
      
      if (!acc[event.action]) {
        acc[event.action] = [];
      }
      acc[event.action].push(event);
      return acc;
    }, {} as Record<string, TimelineEvent[]>);
  }, [startup]);

  // Set first tab as active if none selected
  React.useEffect(() => {
    if (!activeTab && Object.keys(actionGroups).length > 0) {
      setActiveTab(Object.keys(actionGroups)[0]);
    }
  }, [activeTab, actionGroups]);

  // Initialize expanded state for events
  React.useEffect(() => {
    if (activeTab && actionGroups[activeTab]) {
      // By default, expand only the most recent event
      const newExpandedState: Record<string, boolean> = {};
      actionGroups[activeTab].forEach((event, index) => {
        // Use event.id if available, otherwise create a unique key
        const eventKey = event.id || `${activeTab}-${index}`;
        newExpandedState[eventKey] = index === 0;
      });
      setExpandedEvents(newExpandedState);
    }
  }, [activeTab, actionGroups]);

  if (!startup || !startup.timeline || startup.timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-white text-opacity-60">
        <FileText className="w-12 h-12 mb-4 opacity-30" />
        <p>Aucune action n'a encore été effectuée pour cette startup.</p>
        <p className="text-sm mt-2 text-white text-opacity-40">Les résultats des actions apparaîtront ici.</p>
      </div>
    );
  }

  // Format date in French
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Toggle expanded state for an event
  const toggleExpanded = (eventKey: string) => {
    setExpandedEvents(prev => ({
      ...prev,
      [eventKey]: !prev[eventKey]
    }));
  };

  // Détecte si le texte contient des structures de type tableau
  const detectTableStructure = (text: string) => {
    // Recherche des lignes qui commencent par | ou contiennent plusieurs |
    const lines = text.split('\n');
    const tableLines = lines.filter(line => 
      line.trim().startsWith('|') || 
      (line.includes('|') && line.split('|').length > 2)
    );
    
    return tableLines.length > 1;
  };

  // Convertit le texte en structure de tableau
  const convertToTableStructure = (text: string) => {
    // Si le texte contient déjà une structure de tableau, on le retourne tel quel
    if (detectTableStructure(text)) {
      return text;
    }
    
    // Sinon, on essaie de détecter des sections et de les convertir en tableau
    const sections = [];
    
    // Détection des sections "Problème global" et "Problème reformulé"
    const globalProblemMatch = text.match(/Problème global\s*:\s*(.*?)(?=Problème reformulé|$)/s);
    const reformulatedProblemMatch = text.match(/Problème reformulé\s*:\s*(.*?)(?=$)/s);
    
    if (globalProblemMatch || reformulatedProblemMatch) {
      sections.push("| Section | Description |");
      sections.push("| --- | --- |");
      
      if (globalProblemMatch && globalProblemMatch[1]) {
        sections.push(`| **Problème global** | ${globalProblemMatch[1].trim()} |`);
      }
      
      if (reformulatedProblemMatch && reformulatedProblemMatch[1]) {
        sections.push(`| **Problème reformulé** | ${reformulatedProblemMatch[1].trim()} |`);
      }
      
      return sections.join('\n');
    }
    
    // Pour tout autre texte, créer un tableau simple
    const lines = text.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 0) {
      sections.push("| Contenu |");
      sections.push("| --- |");
      
      lines.forEach(line => {
        sections.push(`| ${line.trim()} |`);
      });
      
      return sections.join('\n');
    }
    
    // Si aucun contenu, retourner le texte original
    return text;
  };

  // Format the description with better line breaks and highlighting
  const formatDescription = (description: string) => {
    // Prétraitement pour corriger les balises HTML et les marqueurs
    let formattedText = description;
    
    // Remplacer les balises </strong> isolées
    formattedText = formattedText.replace(/<\/strong>/g, '');
    
    // Convertir les motifs spécifiques en format Markdown
    formattedText = formattedText.replace(/Problème global\s*:/g, '**Problème global** :');
    formattedText = formattedText.replace(/Problème reformulé\s*:/g, '**Problème reformulé** :');
    
    // Toujours convertir en structure de tableau
    formattedText = convertToTableStructure(formattedText);
    
    // Traiter comme un tableau
    return formatTableContent(formattedText);
  };

  // Format table-like content
  const formatTableContent = (description: string) => {
    // Prétraitement pour corriger les balises HTML et les marqueurs
    let formattedDescription = description;
    
    // Remplacer les balises </strong> isolées
    formattedDescription = formattedDescription.replace(/<\/strong>/g, '');
    
    // Convertir les motifs spécifiques en format Markdown
    formattedDescription = formattedDescription.replace(/Problème global\s*:/g, '**Problème global** :');
    formattedDescription = formattedDescription.replace(/Problème reformulé\s*:/g, '**Problème reformulé** :');
    
    // Traiter les marqueurs ** normalement
    formattedDescription = formattedDescription.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');

    const lines = formattedDescription.split('\n');
    
    // Identifier les lignes qui font partie du tableau
    const tableLines = lines.filter(line => 
      line.trim().startsWith('|') || 
      (line.includes('|') && line.split('|').length > 2)
    );
    
    const otherLines = lines.filter(line => 
      !(line.trim().startsWith('|') || 
      (line.includes('|') && line.split('|').length > 2))
    );

    // Traiter les lignes de tableau
    const tableRows = tableLines.map(line => {
      // Supprimer les | au début et à la fin de la ligne
      const trimmedLine = line.trim().replace(/^\||\|$/g, '');
      // Diviser la ligne en cellules
      const cells = trimmedLine.split('|').map(cell => cell.trim());
      return cells;
    });

    // Identifier les en-têtes (première ligne) et les données
    const headers = tableRows[0] || [];
    // Ignorer la ligne de séparation (---) si elle existe
    const dataStartIndex = tableRows.length > 1 && tableRows[1].some(cell => cell.includes('---')) ? 2 : 1;
    const dataRows = tableRows.slice(dataStartIndex);

    return (
      <div className="space-y-6 action-result">
        {otherLines.length > 0 && (
          <div className="mb-4">
            {formatDescription(otherLines.join('\n'))}
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="result-table w-full">
            <thead>
              <tr>
                {headers.map((header, i) => (
                  <th key={i} dangerouslySetInnerHTML={{ __html: header }} className="py-2 px-4 text-left" />
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, rowIndex) => (
                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white bg-opacity-[0.02]' : ''}>
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      dangerouslySetInnerHTML={{ __html: cell }}
                      className="py-2 px-4 border-t border-white border-opacity-5"
                    />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Group events by date for better organization
  const groupEventsByDate = (events: TimelineEvent[]): Record<string, TimelineEvent[]> => {
    return events.reduce((acc, event) => {
      const date = formatDate(event.date);
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {} as Record<string, TimelineEvent[]>);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs navigation */}
      <div className="border-b border-white border-opacity-10 mb-4">
        <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-white scrollbar-thumb-opacity-10 pb-1">
          {Object.keys(actionGroups).map(action => (
            <button
              key={action}
              onClick={() => setActiveTab(action)}
              className={`px-4 py-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === action
                  ? 'border-white text-white'
                  : 'border-transparent text-white text-opacity-60 hover:text-opacity-100'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Content area with scrolling */}
      <div className="overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
        {activeTab && (() => {
          const events = actionGroups[activeTab] || [];
          const eventsByDate = groupEventsByDate(events);
          
          return Object.entries(eventsByDate).map(([date, dateEvents]) => (
            <div key={date} className="mb-6">
              <div className="text-sm font-medium text-white opacity-80 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2 opacity-70" />
                {date}
              </div>
              
              <div className="space-y-3">
                {dateEvents.map((event: TimelineEvent, index: number) => {
                  // Create a unique key for each event
                  const eventKey = event.id || `${activeTab}-${date}-${index}`;
                  const isExpanded = expandedEvents[eventKey] || false;
                  const hasTable = detectTableStructure(event.description);
                  
                  return (
                    <div
                      key={eventKey}
                      className="bg-white bg-opacity-[0.02] rounded-lg overflow-hidden"
                    >
                      {/* Accordion header */}
                      <button 
                        onClick={() => toggleExpanded(eventKey)}
                        className="w-full flex items-center justify-between p-3 text-left focus:outline-none hover:bg-white hover:bg-opacity-[0.01] transition-colors"
                      >
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1.5 text-white text-opacity-60" />
                          <span className="text-sm text-white text-opacity-80">
                            {formatTime(event.date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {hasTable && <Table className="w-4 h-4 mr-2 text-white text-opacity-40" />}
                          <ChevronDown 
                            className={`w-4 h-4 text-white text-opacity-60 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} 
                          />
                        </div>
                      </button>
                      
                      {/* Accordion content with animation */}
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-4 pt-1 border-t border-white border-opacity-5">
                          <div className="text-white text-opacity-90 leading-relaxed">
                            {formatTableContent(event.description)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}

// Add this CSS to your global styles or index.css
// .custom-scrollbar::-webkit-scrollbar {
//   width: 6px;
// }
// .custom-scrollbar::-webkit-scrollbar-track {
//   background: rgba(255, 255, 255, 0.05);
//   border-radius: 3px;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb {
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 3px;
// }
// .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//   background: rgba(255, 255, 255, 0.2);
// }