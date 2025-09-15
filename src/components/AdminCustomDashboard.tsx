import { useState, useEffect, useCallback } from 'react';
import { 
  Layout, 
  Plus, 
  Settings, 
  Save, 
  RefreshCw, 
  Trash2,
  Eye,
  EyeOff,
  Move,
  BarChart3,
  Users,
  Activity,
  Heart,
  Zap,
  AlertTriangle,
  Download,
  Upload,
  X
} from 'lucide-react';
import apiService from '../utils/api';

interface Widget {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  defaultSize: { w: number; h: number };
  configurable: boolean;
  config?: any;
}

interface DashboardConfig {
  userId: number;
  layout: string;
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    position: { x: number; y: number; w: number; h: number };
    config: any;
  }>;
  theme: string;
  updatedAt: string;
}

interface WidgetData {
  [key: string]: any;
}

function AdminCustomDashboard() {
  const [availableWidgets, setAvailableWidgets] = useState<Widget[]>([]);
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig | null>(null);
  const [widgetData, setWidgetData] = useState<WidgetData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Charger les widgets disponibles
      const widgetsResponse = await apiService.get('/admin/dashboard/widgets');
      if (widgetsResponse.success) {
        setAvailableWidgets(widgetsResponse.data);
      }

      // Charger la configuration du tableau de bord
      const configResponse = await apiService.get('/admin/dashboard/config/1'); // User ID 1 pour l'admin
      if (configResponse.success) {
        setDashboardConfig(configResponse.data);
        
        // Charger les données pour chaque widget
        const dataPromises = configResponse.data.widgets.map(async (widget: any) => {
          try {
            const dataResponse = await apiService.get(`/admin/dashboard/widget/${widget.id}/data?config=${JSON.stringify(widget.config)}`);
            return { widgetId: widget.id, data: dataResponse.success ? dataResponse.data : null };
          } catch (error) {
            return { widgetId: widget.id, data: null };
          }
        });

        const widgetDataResults = await Promise.all(dataPromises);
        const dataMap: WidgetData = {};
        widgetDataResults.forEach(result => {
          dataMap[result.widgetId] = result.data;
        });
        setWidgetData(dataMap);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du tableau de bord:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveDashboardConfig = useCallback(async () => {
    if (!dashboardConfig) return;

    try {
      setSaving(true);
      const response = await apiService.post('/admin/dashboard/config', {
        userId: 1,
        config: dashboardConfig
      });

      if (response.success) {
        setDashboardConfig(response.data);
        setEditMode(false);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSaving(false);
    }
  }, [dashboardConfig]);

  const addWidget = useCallback((widget: Widget) => {
    if (!dashboardConfig) return;

    const newWidget = {
      id: `${widget.id}-${Date.now()}`,
      type: widget.type,
      title: widget.title,
      position: { x: 0, y: 0, w: widget.defaultSize.w, h: widget.defaultSize.h },
      config: widget.config || {}
    };

    setDashboardConfig(prev => ({
      ...prev!,
      widgets: [...prev!.widgets, newWidget]
    }));

    setShowWidgetLibrary(false);
  }, [dashboardConfig]);

  const removeWidget = useCallback((widgetId: string) => {
    if (!dashboardConfig) return;

    setDashboardConfig(prev => ({
      ...prev!,
      widgets: prev!.widgets.filter(w => w.id !== widgetId)
    }));
  }, [dashboardConfig]);

  const updateWidgetPosition = useCallback((widgetId: string, position: { x: number; y: number; w: number; h: number }) => {
    if (!dashboardConfig) return;

    setDashboardConfig(prev => ({
      ...prev!,
      widgets: prev!.widgets.map(w => 
        w.id === widgetId ? { ...w, position } : w
      )
    }));
  }, [dashboardConfig]);

  const refreshWidgetData = useCallback(async (widgetId: string) => {
    try {
      const widget = dashboardConfig?.widgets.find(w => w.id === widgetId);
      if (!widget) return;

      const response = await apiService.get(`/admin/dashboard/widget/${widget.type}/data?config=${JSON.stringify(widget.config)}`);
      if (response.success) {
        setWidgetData(prev => ({
          ...prev,
          [widgetId]: response.data
        }));
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    }
  }, [dashboardConfig]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const getWidgetIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Users, Activity, BarChart3, Heart, Zap, AlertTriangle
    };
    return icons[iconName] || BarChart3;
  };

  const renderWidget = (widget: any) => {
    const data = widgetData[widget.id];
    const Icon = getWidgetIcon(availableWidgets.find(w => w.type === widget.type)?.icon || 'BarChart3');

    switch (widget.type) {
      case 'stats':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              </div>
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{data?.total_users || 0}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{data?.active_users || 0}</p>
                <p className="text-sm text-gray-500">Actifs</p>
              </div>
            </div>
          </div>
        );

      case 'activity':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              </div>
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-3">
              {data && data.length > 0 ? (
                data.slice(0, 5).map((user: any, index: number) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Aucune activité récente</p>
              )}
            </div>
          </div>
        );

      case 'chart':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              </div>
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Graphique des tendances</p>
                <p className="text-xs text-gray-400">{data?.length || 0} points de données</p>
              </div>
            </div>
          </div>
        );

      case 'health':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              </div>
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Statut:</span>
                <span className="text-green-600 font-medium">{data?.status || 'healthy'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Uptime:</span>
                <span className="font-medium">{data?.uptime || '99.9%'}</span>
              </div>
            </div>
          </div>
        );

      case 'actions':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              </div>
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data && data.map((action: any, index: number) => (
                <button
                  key={index}
                  className="flex items-center space-x-2 p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'alerts':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              </div>
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="space-y-2">
              {data && data.map((alert: any, index: number) => (
                <div key={index} className={`p-2 rounded-lg text-sm ${
                  alert.type === 'warning' ? 'bg-yellow-50 text-yellow-800' : 'bg-blue-50 text-blue-800'
                }`}>
                  {alert.message}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Icon className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              </div>
              {editMode && (
                <button
                  onClick={() => removeWidget(widget.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-gray-500 text-sm">Widget non supporté</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Personnalisable</h1>
          <p className="text-gray-600 mt-2">Créez et personnalisez votre tableau de bord admin</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setEditMode(!editMode)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              editMode 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {editMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{editMode ? 'Quitter l\'édition' : 'Mode édition'}</span>
          </button>
          
          {editMode && (
            <>
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Ajouter Widget</span>
              </button>
              
              <button
                onClick={saveDashboardConfig}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </>
          )}
          
          <button
            onClick={loadDashboardData}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Grille des widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {dashboardConfig?.widgets.map((widget) => (
          <div
            key={widget.id}
            className={`bg-white rounded-lg shadow-sm border border-gray-200 ${
              editMode ? 'cursor-move' : ''
            }`}
            style={{
              gridColumn: `span ${widget.position.w}`,
              gridRow: `span ${widget.position.h}`
            }}
          >
            {renderWidget(widget)}
          </div>
        ))}
      </div>

      {/* Bibliothèque de widgets */}
      {showWidgetLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Bibliothèque de Widgets</h3>
                <button
                  onClick={() => setShowWidgetLibrary(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableWidgets.map((widget) => {
                  const Icon = getWidgetIcon(widget.icon);
                  return (
                    <div
                      key={widget.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => addWidget(widget)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <Icon className="h-5 w-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">{widget.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{widget.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{widget.category}</span>
                        <span>{widget.defaultSize.w}×{widget.defaultSize.h}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message si aucun widget */}
      {dashboardConfig?.widgets.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun widget configuré</h3>
          <p className="text-gray-500 mb-4">Commencez par ajouter des widgets à votre tableau de bord</p>
          <button
            onClick={() => setShowWidgetLibrary(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un widget</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminCustomDashboard;
