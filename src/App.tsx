import { useState } from 'react';
import { DesignStudioNew } from './components/DesignStudioNew';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { SystemConfig } from './components/SystemConfig';
import { NotificationEngine } from './components/NotificationEngine';
import { AppCenter } from './components/AppCenter';
import { AppCreateModal } from './components/AppCreateModal';
import { Zap, BarChart3, Settings, ArrowLeft, Bell } from 'lucide-react';

type TabType = 'design' | 'notification' | 'config' | 'analytics';

interface Application {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  source?: string;
  creator: string;
  createDate: string;
  updateDate: string;
  formsCount: number;
  publishedFormsCount: number;
  tags?: string[];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('design');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [applications, setApplications] = useState<Application[]>([
    {
      id: 'app-1',
      name: 'IT耗材供应商入驻',
      description: '用于IT耗材供应商入驻申请中涉及相关数据采集',
      status: 'active',
      source: '集成采购部',
      creator: '张伟',
      createDate: '2026-02-20',
      updateDate: '2026-02-20',
      formsCount: 3,
      publishedFormsCount: 2,
      tags: ['供应商入驻'],
    },
    {
      id: 'app-2',
      name: '2026年度原奶采购报价',
      description: '2026年度原奶供应商竞标多轮协同',
      status: 'active',
      source: '系统集成部',
      creator: '李雷',
      createDate: '2026-02-15',
      updateDate: '2026-02-15',
      formsCount: 5,
      publishedFormsCount: 4,
      tags: ['采购报价'],
    },
    {
      id: 'app-3',
      name: '包装材料供应商入驻',
      description: '包装材料供应商入驻与资质管理',
      status: 'draft',
      source: '生产资源部',
      creator: '王强',
      createDate: '2026-02-25',
      updateDate: '2026-02-25',
      formsCount: 2,
      publishedFormsCount: 0,
      tags: ['供应商入驻'],
    },
  ]);

  const tabs = [
    { id: 'design' as const, label: '设计', icon: Zap, desc: 'AI-Bridge Studio' },
    { id: 'notification' as const, label: '通知', icon: Bell, desc: 'Notification' },
    { id: 'config' as const, label: '连接', icon: Settings, desc: 'Connector' },
    { id: 'analytics' as const, label: '分析', icon: BarChart3, desc: 'ChatBI' },
  ];

  const handleCreateApp = (data: { name: string; description: string; source?: string }) => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      name: data.name,
      description: data.description,
      status: 'draft',
      source: data.source,
      creator: '当前用户',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      formsCount: 0,
      publishedFormsCount: 0,
      tags: [],
    };
    setApplications(prev => [...prev, newApp]);
    setSelectedApp(newApp.id);
  };

  const handleEditApp = (appId: string) => {
    setSelectedApp(appId);
    setActiveTab('design');
  };

  const handleDuplicateApp = (appId: string) => {
    const app = applications.find(a => a.id === appId);
    if (app) {
      const newApp: Application = {
        ...app,
        id: `app-${Date.now()}`,
        name: `${app.name} (副本)`,
        status: 'draft',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
      };
      setApplications(prev => [...prev, newApp]);
    }
  };

  const handleDeleteApp = (appId: string) => {
    if (confirm('确定要删除这个应用吗？')) {
      setApplications(prev => prev.filter(a => a.id !== appId));
      if (selectedApp === appId) {
        setSelectedApp(null);
      }
    }
  };

  const handleBackToApps = () => {
    setSelectedApp(null);
    setActiveTab('design');
  };

  const currentApp = applications.find(a => a.id === selectedApp);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedApp && (
                <button
                  onClick={handleBackToApps}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="返回应用列表"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-600" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI-Hub
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedApp && currentApp 
                    ? `当前应用：${currentApp.name}`
                    : '企业内外协同连接平台'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                系统运行中
              </span>
              {currentApp?.source && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  已连接: {currentApp.source}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Only show when app is selected */}
      {selectedApp && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6">
            <nav className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <div className="text-left">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs opacity-70">{tab.desc}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {!selectedApp ? (
          <AppCenter
            applications={applications}
            onNew={() => setShowCreateModal(true)}
            onEdit={handleEditApp}
            onDuplicate={handleDuplicateApp}
            onDelete={handleDeleteApp}
            onEnter={(appId) => setSelectedApp(appId)}
          />
        ) : (
          <>
            {activeTab === 'design' && <DesignStudioNew />}
            {activeTab === 'analytics' && <AnalyticsDashboard />}
            {activeTab === 'config' && <SystemConfig />}
            {activeTab === 'notification' && <NotificationEngine />}
          </>
        )}
      </main>

      {/* Create App Modal */}
      {showCreateModal && (
        <AppCreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateApp}
        />
      )}
    </div>
  );
}