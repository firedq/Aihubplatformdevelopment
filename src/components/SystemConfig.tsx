import { useState } from 'react';
import { Database, Link, Shield, CheckCircle, Settings, Plus, RefreshCw, Edit, X, AlertCircle, Mail, MessageSquare, Eye, EyeOff } from 'lucide-react';

type ConfigTab = 'integration' | 'sms' | 'email';

interface TableMapping {
  id: string;
  tableName: string;
  tableId: string;
  direction: 'in' | 'out';
  timing: 'immediate' | 'delayed' | 'scheduled';
  delayMinutes?: number;
  scheduledTime?: string;
  multiData: 'allow' | 'deny' | 'latest';
}

interface SmsConfig {
  provider: 'aliyun' | 'tencent' | 'custom';
  accessKey: string;
  secretKey: string;
  signName: string;
  templateCode: string;
}

interface EmailConfig {
  method: 'smtp' | 'api';
  smtpServer: string;
  smtpPort: string;
  smtpUsername: string;
  smtpPassword: string;
  apiKey: string;
  senderEmail: string;
}

export function SystemConfig() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('integration');
  const [selectedConnection, setSelectedConnection] = useState<string | null>('zhiyuan-a8');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showTableMappingDialog, setShowTableMappingDialog] = useState(false);
  
  // Version22: 测试结果
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  const [mockTestResult, setMockTestResult] = useState<{ status: 'success' | 'error' | null; message: string }>({ status: null, message: '' });
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState('');
  
  // 密码显示控制
  const [showSmsAk, setShowSmsAk] = useState(false);
  const [showSmsSk, setShowSmsSk] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [showEmailApiKey, setShowEmailApiKey] = useState(false);

  const [newConnection, setNewConnection] = useState({
    oaName: '',
    oaAccount: '',
    restIdAccount: '',
    restIdPassword: '',
    oaServerUrl: '',
  });
  
  const [newTableMapping, setNewTableMapping] = useState<TableMapping>({
    id: '',
    tableName: '',
    tableId: '',
    direction: 'in',
    timing: 'immediate',
    delayMinutes: 0,
    scheduledTime: '',
    multiData: 'allow',
  });
  
  const [tableMappings, setTableMappings] = useState<TableMapping[]>([
    {
      id: 'map-1',
      tableName: '供应商管理',
      tableId: 'TBL_001',
      direction: 'in',
      timing: 'immediate',
      multiData: 'allow',
    },
    {
      id: 'map-2',
      tableName: '采购流程',
      tableId: 'TBL_002',
      direction: 'out',
      timing: 'delayed',
      delayMinutes: 30,
      multiData: 'latest',
    },
    {
      id: 'map-3',
      tableName: '合同管理',
      tableId: 'TBL_003',
      direction: 'in',
      timing: 'scheduled',
      scheduledTime: '09:00',
      multiData: 'deny',
    },
  ]);
  
  const connections = [
    {
      id: 'zhiyuan-a8',
      name: '致远A8',
      type: 'REST API',
      status: 'connected',
      url: 'https://oa-a8.example.com/api',
      oaAccount: 'admin',
      restIdAccount: 'rest_user_001',
      oaServerUrl: 'http://v5.test.iform.cc',
      lastSync: '2分钟前',
    },
    {
      id: 'zhiyuan-gov',
      name: '致远政务',
      type: 'REST API',
      status: 'connected',
      url: 'https://oa-gov.example.com/api',
      oaAccount: 'admin_gov',
      restIdAccount: 'rest_user_002',
      oaServerUrl: 'http://gov.test.iform.cc',
      lastSync: '5分钟前',
    },
    {
      id: 'zhiyuan-a6',
      name: '致远A6',
      type: 'REST API',
      status: 'connected',
      url: 'https://oa-a6.example.com/api',
      oaAccount: 'admin_a6',
      restIdAccount: 'rest_user_003',
      oaServerUrl: 'http://v6.test.iform.cc',
      lastSync: '10分钟前',
    },
  ];

  const [shadowDbConfig, setShadowDbConfig] = useState({
    enabled: true,
    storage: 'postgresql',
    retention: '90',
    piiMasking: true,
  });

  // 短信配置 (Story 3.4)
  const [smsConfig, setSmsConfig] = useState<SmsConfig>({
    provider: 'aliyun',
    accessKey: '****3d5f',
    secretKey: '****7g8h',
    signName: 'AI-Hub平台',
    templateCode: 'SMS_123456789',
  });

  // 邮件配置 (Story 3.5 - P1)
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    method: 'smtp',
    smtpServer: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: 'noreply@example.com',
    smtpPassword: '****pwd',
    apiKey: '',
    senderEmail: 'noreply@example.com',
  });

  const configTabs = [
    { id: 'integration' as const, label: '系统集成', icon: Database },
    { id: 'sms' as const, label: '短信配置', icon: MessageSquare },
    { id: 'email' as const, label: '邮件配置 (P1)', icon: Mail },
  ];

  // Version22: 测试连通性
  const handleTestConnection = () => {
    setTestResult({ status: null, message: '测试中...' });
    
    setTimeout(() => {
      const conn = connections.find(c => c.id === selectedConnection);
      if (!conn) return;
      
      // URL格式验证
      if (!conn.url.match(/^https?:\/\/.+/)) {
        setTestResult({ 
          status: 'error', 
          message: '请输入有效的服务地址（如 http://oa.example.com）' 
        });
        return;
      }
      
      // 模拟成功
      setTestResult({ 
        status: 'success', 
        message: `连接成功！OA版本: 致远A8 V5 8.0+，响应时间: 235ms` 
      });
    }, 1500);
  };

  // Version22: Mock数据测试
  const handleMockTest = () => {
    setMockTestResult({ status: null, message: '发送测试数据中...' });
    
    setTimeout(() => {
      setMockTestResult({ 
        status: 'success', 
        message: '写入测试成功，OA已收到测试记录 (MessageId: MSG_20260314_001)' 
      });
    }, 2000);
  };

  // Story 3.4: 发送测试短信
  const handleSendTestSms = () => {
    if (!testPhone) {
      alert('请输入测试手机号');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(testPhone)) {
      alert('手机号格式不正确');
      return;
    }
    
    alert(`测试短信已发送至 ${testPhone}\nMessageId: SMS_20260314_001`);
  };

  // Story 3.5: 发送测试邮件 (P1)
  const handleSendTestEmail = () => {
    if (!testEmail) {
      alert('请输入测试邮箱');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail)) {
      alert('邮箱格式不正确');
      return;
    }
    
    alert(`测试邮件已发送至 ${testEmail}\n请检查收件箱（含垃圾邮件文件夹）`);
  };

  const handleSaveSmsConfig = () => {
    if (!smsConfig.accessKey || !smsConfig.secretKey || !smsConfig.signName || !smsConfig.templateCode) {
      alert('请填写所有必填字段');
      return;
    }
    
    alert('短信配置保存成功！AccessKey/SecretKey已加密存储。');
  };

  const handleSaveEmailConfig = () => {
    if (emailConfig.method === 'smtp') {
      if (!emailConfig.smtpServer || !emailConfig.smtpPort || !emailConfig.smtpUsername || !emailConfig.smtpPassword) {
        alert('请填写所有SMTP配置字段');
        return;
      }
    } else {
      if (!emailConfig.apiKey || !emailConfig.senderEmail) {
        alert('请填写API配置字段');
        return;
      }
    }
    
    alert('邮件配置保存成功！凭证已加密存储。');
  };

  // 添加数据表映射
  const handleAddTableMapping = () => {
    if (!newTableMapping.tableName || !newTableMapping.tableId) {
      alert('请填写表单名称和表单ID');
      return;
    }
    
    if (newTableMapping.timing === 'delayed' && (!newTableMapping.delayMinutes || newTableMapping.delayMinutes <= 0)) {
      alert('请输入有效的延迟时间（分钟）');
      return;
    }
    
    if (newTableMapping.timing === 'scheduled' && !newTableMapping.scheduledTime) {
      alert('请选择固定时间');
      return;
    }
    
    const mapping: TableMapping = {
      ...newTableMapping,
      id: `map-${Date.now()}`,
    };
    
    setTableMappings([...tableMappings, mapping]);
    setShowTableMappingDialog(false);
    
    // 重置表单
    setNewTableMapping({
      id: '',
      tableName: '',
      tableId: '',
      direction: 'in',
      timing: 'immediate',
      delayMinutes: 0,
      scheduledTime: '',
      multiData: 'allow',
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex gap-1 px-6">
            {configTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Integration Tab (Version21 + Version22 Tests) */}
        {activeTab === 'integration' && (
          <div className="p-6">
            <div className="space-y-6">
              {/* Connection List */}
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-slate-900">企业系统连接</h2>
                  <p className="text-sm text-slate-600 mt-1">管理与企业系统的数据连接</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      onClick={() => setSelectedConnection(conn.id)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedConnection === conn.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-5 h-5 text-slate-600" />
                          <h3 className="font-medium text-slate-900">{conn.name}</h3>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            conn.status === 'connected'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {conn.status === 'connected' ? '已连接' : '未连接'}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Link className="w-3 h-3" />
                          <span className="text-xs">{conn.type}</span>
                        </div>
                        {conn.status === 'connected' && (
                          <div className="text-xs text-slate-500">
                            最后同步: {conn.lastSync}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connection Details */}
              {selectedConnection && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configuration */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">连接配置</h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {connections.find(c => c.id === selectedConnection)?.name}
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          连接地址
                        </label>
                        <input
                          type="text"
                          value={connections.find(c => c.id === selectedConnection)?.url}
                          readOnly
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          认证方式
                        </label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                          <option>OAuth 2.0</option>
                          <option>API Key</option>
                          <option>Basic Auth</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          同步频率
                        </label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                          <option>实时同步</option>
                          <option>每5分钟</option>
                          <option>每小时</option>
                          <option>手动同步</option>
                        </select>
                      </div>

                      {/* Version22: 接口测试区域 */}
                      <div className="border-t border-slate-200 pt-4 mt-4">
                        <h4 className="font-medium text-slate-900 mb-3 text-sm">接口测试</h4>
                        
                        <div className="space-y-3">
                          {/* 连通性测试 */}
                          <div>
                            <button
                              onClick={handleTestConnection}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm"
                            >
                              <RefreshCw className="w-4 h-4" />
                              测试连通性
                            </button>
                            
                            {testResult.status && (
                              <div className={`mt-2 p-2 rounded-lg border text-xs ${
                                testResult.status === 'success'
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-red-50 border-red-200 text-red-800'
                              }`}>
                                <div className="flex items-start gap-2">
                                  {testResult.status === 'success' ? (
                                    <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  )}
                                  <p>{testResult.message}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Mock数据测试 */}
                          <div>
                            <button
                              onClick={handleMockTest}
                              disabled={testResult.status !== 'success'}
                              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Database className="w-4 h-4" />
                              Mock数据测试
                            </button>
                            
                            {mockTestResult.status && (
                              <div className={`mt-2 p-2 rounded-lg border text-xs ${
                                mockTestResult.status === 'success'
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-red-50 border-red-200 text-red-800'
                              }`}>
                                <div className="flex items-start gap-2">
                                  {mockTestResult.status === 'success' ? (
                                    <CheckCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  )}
                                  <p>{mockTestResult.message}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <button className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                          保存配置
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Data Mapping */}
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4">数据表映射</h3>
                    <p className="text-sm text-slate-600 mb-4">已对接的业务表</p>

                    <div className="space-y-3">
                      {tableMappings.map((table) => (
                        <div
                          key={table.id}
                          className="p-3 bg-white rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <div>
                                <div className="font-medium text-sm text-slate-900">
                                  {table.tableName}
                                </div>
                                <div className="text-xs text-slate-500">
                                  表ID: {table.tableId}
                                </div>
                              </div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-700 text-xs">
                              配置
                            </button>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-600 ml-6">
                            <span className={`px-2 py-0.5 rounded ${table.direction === 'in' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                              {table.direction === 'in' ? '数据传入' : '数据传出'}
                            </span>
                            <span className="text-slate-500">
                              {table.timing === 'immediate' && '立即同步'}
                              {table.timing === 'delayed' && `延迟${table.delayMinutes}分钟`}
                              {table.timing === 'scheduled' && `定时${table.scheduledTime}`}
                            </span>
                            <span className="text-slate-500">
                              {table.multiData === 'allow' && '允许多条'}
                              {table.multiData === 'deny' && '不允许多条'}
                              {table.multiData === 'latest' && '接收最新'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      className="w-full mt-4 px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:text-slate-700 text-sm" 
                      onClick={() => setShowTableMappingDialog(true)}
                    >
                      + 添加数据表映射
                    </button>
                  </div>
                </div>
              )}

              {/* Shadow Database Config */}
              <div className="bg-white rounded-xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    影子数据库配置
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    配置AI分析用数据副本存储策略
                  </p>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={shadowDbConfig.enabled}
                          onChange={(e) => setShadowDbConfig({ ...shadowDbConfig, enabled: e.target.checked })}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-700">启用影子数据库</span>
                      </label>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            存储方式
                          </label>
                          <select
                            value={shadowDbConfig.storage}
                            onChange={(e) => setShadowDbConfig({ ...shadowDbConfig, storage: e.target.value })}
                            disabled={!shadowDbConfig.enabled}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="postgresql">PostgreSQL</option>
                            <option value="mysql">MySQL</option>
                            <option value="mongodb">MongoDB</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            数据保留期限（天）
                          </label>
                          <input
                            type="number"
                            value={shadowDbConfig.retention}
                            onChange={(e) => setShadowDbConfig({ ...shadowDbConfig, retention: e.target.value })}
                            disabled={!shadowDbConfig.enabled}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 mb-3">
                        <input
                          type="checkbox"
                          checked={shadowDbConfig.piiMasking}
                          onChange={(e) => setShadowDbConfig({ ...shadowDbConfig, piiMasking: e.target.checked })}
                          disabled={!shadowDbConfig.enabled}
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm font-medium text-slate-700">PII自动脱敏</span>
                      </label>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">脱敏规则</h4>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• 手机号：保留前3后4位</li>
                          <li>• 身份证：保留前6后4位</li>
                          <li>• 银行卡：保留后4位</li>
                          <li>• 姓名：保留姓氏</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6 pt-6 border-t border-slate-200">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                      保存配置
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Config (Story 3.4) */}
        {activeTab === 'sms' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">短信通知服务配置</h3>
              <p className="text-sm text-slate-600">
                配置短信服务商接口参数，支持阿里云、腾讯云和自定义服务商
              </p>
            </div>

            {/* 服务商选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                短信服务商 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="smsProvider"
                    value="aliyun"
                    checked={smsConfig.provider === 'aliyun'}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: 'aliyun' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">阿里云</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="smsProvider"
                    value="tencent"
                    checked={smsConfig.provider === 'tencent'}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: 'tencent' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">腾讯云</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="smsProvider"
                    value="custom"
                    checked={smsConfig.provider === 'custom'}
                    onChange={(e) => setSmsConfig({ ...smsConfig, provider: 'custom' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">自定义</span>
                </label>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                通过SmsClientFactory动态切换，无需重启服务
              </p>
            </div>

            {/* 服务商配置 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  AccessKey <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSmsAk ? 'text' : 'password'}
                    value={smsConfig.accessKey}
                    onChange={(e) => setSmsConfig({ ...smsConfig, accessKey: e.target.value })}
                    placeholder="输入AccessKey"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsAk(!showSmsAk)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showSmsAk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  SecretKey <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showSmsSk ? 'text' : 'password'}
                    value={smsConfig.secretKey}
                    onChange={(e) => setSmsConfig({ ...smsConfig, secretKey: e.target.value })}
                    placeholder="输入SecretKey"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmsSk(!showSmsSk)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showSmsSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  短信签名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={smsConfig.signName}
                  onChange={(e) => setSmsConfig({ ...smsConfig, signName: e.target.value })}
                  placeholder="AI-Hub平台"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  模板CODE <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={smsConfig.templateCode}
                  onChange={(e) => setSmsConfig({ ...smsConfig, templateCode: e.target.value })}
                  placeholder="SMS_123456789"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* 测试短信 */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-medium text-slate-900 mb-4">发送测试短信</h4>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="输入测试手机号"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendTestSms}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  发送测试
                </button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                💡 发送成功后会显示MessageId，失败时显示具体错误（余额不足/签名未审核/手机号格式错误）
              </p>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                重置
              </button>
              <button
                onClick={handleSaveSmsConfig}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                保存配置
              </button>
            </div>
          </div>
        )}

        {/* Email Config (Story 3.5 - P1) */}
        {activeTab === 'email' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
                邮件通知服务配置
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">P1</span>
              </h3>
              <p className="text-sm text-slate-600">
                配置SMTP服务器或邮件服务商API，支持SendGrid、阿里云邮件推送等
              </p>
            </div>

            {/* 发送方式选择 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                发送方式 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="emailMethod"
                    value="smtp"
                    checked={emailConfig.method === 'smtp'}
                    onChange={(e) => setEmailConfig({ ...emailConfig, method: 'smtp' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">SMTP</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="emailMethod"
                    value="api"
                    checked={emailConfig.method === 'api'}
                    onChange={(e) => setEmailConfig({ ...emailConfig, method: 'api' })}
                    className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">服务商API</span>
                </label>
              </div>
            </div>

            {/* SMTP配置 */}
            {emailConfig.method === 'smtp' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SMTP服务器 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpServer}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpServer: e.target.value })}
                    placeholder="smtp.example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    SMTP端口 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                    placeholder="587"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    发件人账号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailConfig.smtpUsername}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpUsername: e.target.value })}
                    placeholder="noreply@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    发件人密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showSmtpPassword ? 'text' : 'password'}
                      value={emailConfig.smtpPassword}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                      placeholder="输入密码"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* API配置 */}
            {emailConfig.method === 'api' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEmailApiKey ? 'text' : 'password'}
                      value={emailConfig.apiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, apiKey: e.target.value })}
                      placeholder="输入API Key"
                      className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailApiKey(!showEmailApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                    >
                      {showEmailApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    发件人地址 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={emailConfig.senderEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                    placeholder="noreply@example.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* 测试邮件 */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="font-medium text-slate-900 mb-4">发送测试邮件</h4>
              
              <div className="flex gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="输入测试邮箱"
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendTestEmail}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm"
                >
                  <Mail className="w-4 h-4" />
                  发送测试
                </button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                💡 测试邮件发送成功后，请检查收件箱（含垃圾邮件文件夹）
              </p>
            </div>

            {/* 保存按钮 */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm">
                重置
              </button>
              <button
                onClick={handleSaveEmailConfig}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                保存配置
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table Mapping Dialog */}
      {showTableMappingDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowTableMappingDialog(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-slate-900">
                添加数据表映射
              </h2>
              <button
                onClick={() => setShowTableMappingDialog(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-6">
              {/* 表单信息 */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                  表单信息
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      致远表单名称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTableMapping.tableName}
                      onChange={(e) => setNewTableMapping({ ...newTableMapping, tableName: e.target.value })}
                      placeholder="例如：供应商入驻申请"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      表单ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTableMapping.tableId}
                      onChange={(e) => setNewTableMapping({ ...newTableMapping, tableId: e.target.value })}
                      placeholder="例如：TBL_004"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 数据对接方式 */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
                  数据对接方式
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    选择方式 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="direction"
                        value="in"
                        checked={newTableMapping.direction === 'in'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, direction: 'in' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">数据传入（从OA到AI-Hub）</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="direction"
                        value="out"
                        checked={newTableMapping.direction === 'out'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, direction: 'out' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">数据传出（从AI-Hub到OA）</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 数据对接规则 */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <h3 className="font-medium text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">3</span>
                  数据对接规则
                </h3>
                
                {/* 对接时间 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    数据对接时间 <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timing"
                        value="immediate"
                        checked={newTableMapping.timing === 'immediate'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, timing: 'immediate', delayMinutes: 0, scheduledTime: '' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">立即同步</span>
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timing"
                        value="delayed"
                        checked={newTableMapping.timing === 'delayed'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, timing: 'delayed', scheduledTime: '' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 mr-2">延迟</span>
                      <input
                        type="number"
                        value={newTableMapping.delayMinutes || ''}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, delayMinutes: parseInt(e.target.value) || 0, timing: 'delayed' })}
                        placeholder="0"
                        min="0"
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                        disabled={newTableMapping.timing !== 'delayed'}
                      />
                      <span className="text-sm text-slate-700">分钟</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="timing"
                        value="scheduled"
                        checked={newTableMapping.timing === 'scheduled'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, timing: 'scheduled', delayMinutes: 0 })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700 mr-2">固定时间</span>
                      <input
                        type="time"
                        value={newTableMapping.scheduledTime || ''}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, scheduledTime: e.target.value, timing: 'scheduled' })}
                        className="px-2 py-1 border border-slate-300 rounded text-sm disabled:opacity-50"
                        disabled={newTableMapping.timing !== 'scheduled'}
                      />
                    </div>
                  </div>
                </div>

                {/* 多条数据处理 */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    是否允许多条数据 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="multiData"
                        value="allow"
                        checked={newTableMapping.multiData === 'allow'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, multiData: 'allow' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">允许多条</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="multiData"
                        value="deny"
                        checked={newTableMapping.multiData === 'deny'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, multiData: 'deny' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">不允许多条</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="multiData"
                        value="latest"
                        checked={newTableMapping.multiData === 'latest'}
                        onChange={(e) => setNewTableMapping({ ...newTableMapping, multiData: 'latest' })}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">接收最新</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">配置说明</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 数据传入：从致远OA系统读取数据到AI-Hub平台</li>
                      <li>• 数据传出：将AI-Hub平台数据推送至致远OA系统</li>
                      <li>• 立即同步：数据变化后立即执行对接</li>
                      <li>• 延迟同步：数据变化后延迟指定时间执行对接</li>
                      <li>• 固定时间：每天在固定时间执行对接</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowTableMappingDialog(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddTableMapping}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  添加映射
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}