import React from 'react';
import { useStartupStore } from '../store/startupStore';
import type { Startup as ImportedStartup } from '../store/startupStore';
import { 
  PlusCircle, 
  BarChart2, 
  Users, 
  List, 
  Columns, 
  Edit, 
  Trash2,
  Briefcase,
  CheckCircle,
  X,
  ChevronDown,
  Search,
  Tag,
  ChevronRight,
  Save,
  CalendarDays,
  ArrowUpDown,
  RefreshCw,
  Calendar,
  Info as InfoIcon
} from 'lucide-react';

type StartupStatus = 'To Analyze' | 'In Progress' | 'Resolved';
type ViewMode = 'kanban' | 'list';
type Startup = ImportedStartup;

// TypeScript type for drag and drop result
interface DropResult {
  draggableId: string;
  destination: {
    droppableId: string;
  } | null;
}

interface TableColumn {
  id: keyof Startup;
  label: string;
  visible: boolean;
  renderCell: (startup: Startup) => React.ReactNode;
}

const EditModal = ({ 
  isOpen, 
  onClose, 
  startup,
  onSave,
  isSaving
}: { 
  isOpen: boolean;
  onClose: () => void;
  startup: Startup | null;
  onSave: (data: Partial<Startup>) => void;
  isSaving: boolean;
}) => {
  const [formData, setFormData] = React.useState<Partial<Startup>>({});
  const [activeTab, setActiveTab] = React.useState('info');

  React.useEffect(() => {
    if (startup) {
      setFormData({
        name: startup.name,
        representative: startup.representative,
        sector: startup.sector,
        needs: startup.needs,
        problems: startup.problems,
        status: startup.status
      });
    }
  }, [startup]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-stone-950 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white border-opacity-10">
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10 bg-gradient-to-r from-white/[0.03] to-transparent">
          <h2 className="text-xl font-bold text-white">
            {startup ? 'Modifier la startup' : 'Nouvelle startup'}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-white border-opacity-10">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'info' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-white text-opacity-60 hover:text-opacity-100'
            }`}
          >
            Informations générales
          </button>
          <button
            onClick={() => setActiveTab('needs')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'needs' 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-white text-opacity-60 hover:text-opacity-100'
            }`}
          >
            Besoins et problèmes
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'info' ? (
            <div className="space-y-6">
              <div className="transition-all duration-200 hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-2 flex items-center">
                  <span className="bg-blue-500/20 p-1 rounded mr-2">
                    <Users className="w-4 h-4 text-blue-400" />
                  </span>
                  Nom de la startup
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="transition-all duration-200 hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-2 flex items-center">
                  <span className="bg-purple-500/20 p-1 rounded mr-2">
                    <Users className="w-4 h-4 text-purple-400" />
                  </span>
                  Représentant
                </label>
                <input
                  type="text"
                  value={formData.representative || ''}
                  onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                  className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="transition-all duration-200 hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-2 flex items-center">
                  <span className="bg-emerald-500/20 p-1 rounded mr-2">
                    <Briefcase className="w-4 h-4 text-emerald-400" />
                  </span>
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  value={formData.sector || ''}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  required
                />
              </div>

              <div className="transition-all duration-200 hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-2 flex items-center">
                  <span className={`p-1 rounded mr-2 ${
                    formData.status === 'To Analyze' ? 'bg-amber-500/20' : 
                    formData.status === 'In Progress' ? 'bg-blue-500/20' : 
                    'bg-emerald-500/20'
                  }`}>
                    {formData.status === 'To Analyze' ? <BarChart2 className="w-4 h-4 text-amber-400" /> : 
                     formData.status === 'In Progress' ? <Calendar className="w-4 h-4 text-blue-400" /> : 
                     <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  </span>
                  Statut
                </label>
                <select
                  value={formData.status || ''}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StartupStatus })}
                  className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all duration-200"
                >
                  <option value="To Analyze" className="bg-stone-950">To Analyze</option>
                  <option value="In Progress" className="bg-stone-950">In Progress</option>
                  <option value="Resolved" className="bg-stone-950">Resolved</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="transition-all duration-200 hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-2 flex items-center">
                  <span className="bg-blue-500/20 p-1 rounded mr-2">
                    <Tag className="w-4 h-4 text-blue-400" />
                  </span>
                  Besoins
                </label>
                <textarea
                  value={formData.needs || ''}
                  onChange={(e) => setFormData({ ...formData, needs: e.target.value })}
                  className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y transition-all duration-200"
                  placeholder="Séparés par des virgules"
                />
              </div>

              <div className="transition-all duration-200 hover:translate-x-1">
                <label className="block text-sm font-medium text-white mb-2 flex items-center">
                  <span className="bg-amber-500/20 p-1 rounded mr-2">
                    <BarChart2 className="w-4 h-4 text-amber-400" />
                  </span>
                  Problèmes
                </label>
                <textarea
                  value={formData.problems || ''}
                  onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
                  className="w-full bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-y transition-all duration-200"
                  placeholder="Problèmes rencontrés par la startup"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white border-opacity-10 bg-gradient-to-r from-white/[0.03] to-transparent">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Annuler
            </button>
            <button
              onClick={() => onSave(formData)}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20 flex items-center gap-2 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Replace the Kanban view with a simple grid
const KanbanView = ({ startups }: { startups: Startup[] }) => {
  const columns = ['To Analyze', 'In Progress', 'Resolved'];
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map(status => (
        <div key={status} className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">{status}</h3>
          <div className="space-y-4">
            {startups
              .filter(startup => startup.status === status)
              .map(startup => (
                <div 
                  key={startup.id}
                  className="bg-gray-700 p-4 rounded-lg shadow"
                >
                  <h4 className="font-medium">{startup.name}</h4>
                  <p className="text-sm text-gray-400">{startup.representative}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export function StartupList() {
  const { startups, fetchStartups, loading, updateStartup, deleteStartup } = useStartupStore();
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StartupStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [menuOpen, setMenuOpen] = React.useState<string | null>(null);
  const [isStartupFormOpen, setIsStartupFormOpen] = React.useState(false);
  const [selectedStartup, setSelectedStartup] = React.useState<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = React.useState(false);
  
  // Tableau de colonnes visibles (utilisé pour gérer l'affichage des colonnes)
  const [tableColumns, setTableColumns] = React.useState<TableColumn[]>([
    { 
      id: 'name', 
      label: 'Nom', 
      visible: true,
      renderCell: (startup) => (
        <div className="font-medium text-white">{startup.name}</div>
      )
    },
    { 
      id: 'representative', 
      label: 'Représentant', 
      visible: true,
      renderCell: (startup) => (
        <div className="flex items-center text-white text-opacity-80">
          <Users className="w-4 h-4 mr-2 text-white text-opacity-40" />
          {startup.representative}
        </div>
      )
    },
    { 
      id: 'sector', 
      label: 'Secteur', 
      visible: true,
      renderCell: (startup) => (
        <div className="flex items-center text-white text-opacity-80">
          <Briefcase className="w-4 h-4 mr-2 text-white text-opacity-40" />
          {startup.sector}
        </div>
      )
    },
    { 
      id: 'needs', 
      label: 'Besoins', 
      visible: true,
      renderCell: (startup) => (
        <div className="flex flex-wrap gap-1.5 max-w-xs">
          {startup.needs?.split(',').map((need: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 bg-white bg-opacity-[0.05] text-white text-opacity-80 rounded-full text-xs hover:bg-opacity-10 transition-colors"
            >
              {need.trim()}
            </span>
          ))}
        </div>
      )
    },
    { 
      id: 'problems', 
      label: 'Problèmes', 
      visible: true,
      renderCell: (startup) => (
        <div className="py-1">
          {startup.problems ? (
            <div className="text-white text-opacity-80 text-sm line-clamp-3 hover:line-clamp-none transition-all duration-300">
              {startup.problems}
            </div>
          ) : (
            <span className="text-white text-opacity-40 text-sm italic">Non spécifié</span>
          )}
        </div>
      )
    },
    { 
      id: 'status', 
      label: 'Statut', 
      visible: true,
      renderCell: (startup) => (
        <div className={`flex items-center text-white text-opacity-80 py-1 px-2 rounded-full ${getStatusBg(startup.status)}`}>
          {getStatusIcon(startup.status)}
          <span className="text-sm">{startup.status}</span>
        </div>
      )
    }
  ]);

  React.useEffect(() => {
    fetchStartups();
  }, [fetchStartups]);

  const filteredStartups = React.useMemo(() => {
    return startups
      .filter(startup => {
        const matchesSearch = 
          searchTerm === '' || 
          startup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          startup.representative.toLowerCase().includes(searchTerm.toLowerCase()) ||
          startup.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
          startup.needs?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || startup.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort(() => {
        // Ici on utilise une date générique pour le tri, car nous n'avons pas de champ date
        return sortOrder === 'asc' ? 1 : -1;
      });
  }, [startups, searchTerm, statusFilter, sortOrder]);

  // Fonction de gestion des suppressions
  const handleDeleteStartup = (id: string) => {
    if (confirmDelete === id) {
      deleteStartup(id);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  // Fonction pour obtenir la couleur de fond en fonction du statut
  const getStatusBg = (status: StartupStatus) => {
    switch (status) {
      case 'To Analyze': return 'bg-amber-400 bg-opacity-10';
      case 'In Progress': return 'bg-blue-400 bg-opacity-10';
      case 'Resolved': return 'bg-emerald-400 bg-opacity-10';
      default: return 'bg-white bg-opacity-10';
    }
  };

  // Fonction pour obtenir l'icône en fonction du statut
  const getStatusIcon = (status: StartupStatus) => {
    switch (status) {
      case 'To Analyze': return <BarChart2 className="w-4 h-4 mr-2 text-amber-400" />;
      case 'In Progress': return <Calendar className="w-4 h-4 mr-2 text-blue-400" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />;
      default: return null;
    }
  };

  // Fonction pour démarrer l'édition d'une startup
  const handleEditRow = (startup: Startup) => {
    setSelectedStartup(startup.id);
    setIsStartupFormOpen(true);
  };

  // Fonction pour sauvegarder une startup (nouvelle ou mise à jour)
  const handleSaveStartup = async (data: Partial<Startup>) => {
    if (selectedStartup) {
      await updateStartup(selectedStartup, data);
    } else {
      await useStartupStore.getState().addStartup({
        name: data.name || '',
        representative: data.representative || '',
        sector: data.sector || '',
        needs: data.needs || '',
        problems: data.problems || '',
        status: data.status || 'To Analyze',
        timeline: [],
        resources: [],
        solutions: '',
        diagnostic_results: null
      });
    }
    setIsStartupFormOpen(false);
    setSelectedStartup(null);
  };

  // Gestion du clic en dehors des menus
  const handleClickOutside = () => {
    setMenuOpen(null);
  };

  React.useEffect(() => {
    if (menuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => {
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [menuOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-blue-400 animate-pulse">Chargement des startups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-6">
        <div className="flex items-center text-white text-opacity-60 text-sm mb-2">
          <span className="hover:text-opacity-100 cursor-pointer">Dashboard</span>
          <ChevronRight className="w-3 h-3 mx-2" />
          <span className="text-white">Startups</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white bg-clip-text text-transparent">Startups</h1>
            <div className="bg-white bg-opacity-10 px-2.5 py-1 rounded-full text-xs font-medium">
              {startups.length} startups
            </div>
          </div>
          
        <button
            onClick={() => fetchStartups()}
            className="flex items-center gap-2 px-3 py-1 rounded-md hover:bg-white hover:bg-opacity-5 text-sm"
        >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
        </button>
        </div>
      </div>

      <div className="bg-white bg-opacity-[0.03] backdrop-blur-sm border border-white border-opacity-5 rounded-xl p-4 mb-8 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-white text-opacity-40" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, secteur, représentant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-white placeholder-opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative">
              <button
                onClick={() => setShowColumnSettings(!showColumnSettings)}
                className="h-10 px-4 bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg flex items-center gap-2 hover:bg-opacity-[0.05] transition-all"
              >
                <Columns className="w-4 h-4" />
                <span className="text-sm">Colonnes</span>
              </button>
              
              {showColumnSettings && (
                <div className="absolute right-0 mt-2 bg-stone-950 rounded-lg shadow-xl border border-white border-opacity-10 w-64 py-2 z-20">
                  <div className="px-4 py-2 border-b border-white border-opacity-10">
                    <h3 className="text-sm font-medium">Colonnes visibles</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {tableColumns.map((column) => (
                      <label key={column.id} className="flex items-center px-4 py-2 hover:bg-white hover:bg-opacity-5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={column.visible}
                          onChange={() => {
                            setTableColumns(prev => {
                              const newColumns = prev.map(c =>
                                c.id === column.id ? { ...c, visible: !c.visible } : c
                              );
                              return newColumns;
                            });
                          }}
                          className="form-checkbox h-4 w-4 text-blue-500 rounded border-white border-opacity-20 bg-transparent"
                        />
                        <span className="ml-3 text-sm">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/20 p-1.5 rounded">
                  <CalendarDays className="w-4 h-4 text-blue-400" />
                </div>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="h-10 bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg pl-3 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all min-w-[140px]"
                >
                  <option value="desc" className="bg-stone-950">Plus récent d'abord</option>
                  <option value="asc" className="bg-stone-950">Plus ancien d'abord</option>
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-3 pointer-events-none">
                  <ArrowUpDown className="h-4 w-4 text-white text-opacity-40" />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StartupStatus | 'all')}
                className="h-10 bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg px-4 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer transition-all"
              >
                <option value="all">Tous les statuts</option>
                <option value="To Analyze">To Analyze</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-white text-opacity-40" />
              </div>
            </div>
            
            <div className="bg-white bg-opacity-[0.03] border border-white border-opacity-10 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban' 
                    ? 'bg-white bg-opacity-10 text-white' 
                    : 'text-white text-opacity-70 hover:text-opacity-100'
                }`}
              >
                <Columns className="w-4 h-4" />
                <span className="text-sm font-medium">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white bg-opacity-10 text-white' 
                    : 'text-white text-opacity-70 hover:text-opacity-100'
                }`}
              >
                <List className="w-4 h-4" />
                <span className="text-sm font-medium">Liste</span>
              </button>
            </div>
            
            <button
              onClick={() => {
                setSelectedStartup(null);
                setIsStartupFormOpen(true);
              }}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="font-medium">Nouvelle startup</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`
        flex-1 overflow-auto
        ${viewMode === 'list' ? 'h-[calc(100vh-16rem)]' : ''}
      `}>
        {viewMode === 'kanban' ? (
          <KanbanView startups={filteredStartups} />
        ) : (
          <div className="bg-white bg-opacity-[0.02] backdrop-blur-sm rounded-xl overflow-hidden border border-white border-opacity-5 overflow-x-auto shadow-sm flex-1">
            <table className="w-full min-w-[800px] border-collapse">
              <thead className="sticky top-0 z-10 bg-[#1a1a1a]">
                <tr className="border-b border-white border-opacity-10 bg-gradient-to-r from-white/[0.03] to-white/[0.01]">
                  {tableColumns.map(column => column.visible && (
                    <th key={column.id} className="py-4 px-4 text-left font-medium text-sm text-white">
                      {column.label}
                    </th>
                  ))}
                  <th className="py-4 px-4 text-right font-medium text-sm text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStartups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-white text-opacity-40">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-white bg-opacity-5 rounded-full mb-3">
                          <InfoIcon className="w-8 h-8 opacity-40" />
                        </div>
                        <span className="text-lg mb-2">Aucune startup trouvée</span>
                        <p className="text-sm text-white text-opacity-40 mb-4 max-w-md">
                          Aucune startup ne correspond à vos critères de recherche ou le tableau est vide.
                        </p>
                        <button
                          onClick={() => {
                            setSelectedStartup(null);
                            setIsStartupFormOpen(true);
                          }}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Ajouter une startup</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStartups.map((startup, index) => (
                    <tr 
                      key={startup.id}
                      className={`border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-[0.04] transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white bg-opacity-[0.01]' : ''
                      }`}
                    >
                      {tableColumns.map(column => column.visible && (
                        <td key={column.id} className="py-4 px-4">
                          {column.renderCell(startup)}
                        </td>
                      ))}
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditRow(startup)}
                            className="p-2 hover:bg-blue-500/20 rounded-lg transition-all duration-200 text-white text-opacity-60 hover:text-opacity-100 transform hover:scale-110"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStartup(startup.id)}
                            className={`p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 transform hover:scale-110 ${
                              confirmDelete === startup.id ? 'text-red-400 bg-red-500/10' : 'text-white text-opacity-60 hover:text-opacity-100'
                            }`}
                            title={confirmDelete === startup.id ? 'Confirmer la suppression' : 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <EditModal
        isOpen={isStartupFormOpen}
        onClose={() => {
          setIsStartupFormOpen(false);
          setSelectedStartup(null);
        }}
        startup={selectedStartup ? startups.find(s => s.id === selectedStartup) || null : null}
        onSave={handleSaveStartup}
        isSaving={false}
      />
    </div>
  );
}
