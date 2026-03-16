import { useState } from 'react';
import { Bell, Plus, Edit, Trash2, Eye, AlertCircle, X } from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // 触发条件 (Story 6.1)
  triggerField: string;
  triggerCondition: 'equals' | 'not_equals' | 'contains' | 'greater' | 'less' | 'greater_or_equal' | 'less_or_equal';
  triggerValue: string;
  
  // 发送对象 (Story 6.2)
  recipientType: 'phone' | 'role';
  recipientPhones: string; // 逗号分隔的手机号
  recipientRole: string;
  
  // 通知渠道 (Story 6.2)
  channels: {
    sms: boolean;
    wechat: boolean;
    email: boolean;
  };
  
  // 消息模板 (Story 6.3)
  messageTemplates: {
    sms: string;
    wechat: string;
    email: string;
  };
}

// 表单字段列表（模拟数据，实际应从表单定义中获取）
const formFields = [
  { id: 'supplier_name', name: '供应商名称', type: 'text' },
  { id: 'contact_phone', name: '联系电话', type: 'text' },
  { id: 'quote_amount', name: '报价金额', type: 'number' },
  { id: 'quote_type', name: '报价类型', type: 'text' },
  { id: 'approval_status', name: '审批状态', type: 'text' },
  { id: 'submit_date', name: '提交日期', type: 'date' },
];

// RBAC角色列表（模拟数据）
const roleList = [
  { id: 'procurement_manager', name: '采购经理' },
  { id: 'app_admin', name: '应用配置管理员' },
  { id: 'data_admin', name: '数据管理员' },
  { id: 'finance_staff', name: '财务人员' },
];

// 系统内置变量 (Story 6.3)
const systemVariables = [
  { key: '{{提交时间}}', description: '供应商提交时间（精确到分钟）' },
  { key: '{{表单名称}}', description: '当前表单名称' },
  { key: '{{供应商名称}}', description: 'SSO身份中的供应商名称' },
  { key: '{{截止时间}}', description: '表单填写截止时间' },
];

export function NotificationEngine() {
  const [rules, setRules] = useState<NotificationRule[]>([
    {
      id: 'rule-1',
      name: '高额报价提醒',
      description: '当报价金额超过10万时通知采购经理',
      enabled: true,
      triggerField: 'quote_amount',
      triggerCondition: 'greater',
      triggerValue: '100000',
      recipientType: 'role',
      recipientPhones: '',
      recipientRole: 'procurement_manager',
      channels: { sms: true, wechat: true, email: false },
      messageTemplates: {
        sms: '尊敬的采购经理，供应商{{供应商名称}}提交的报价金额为{{报价金额}}元，已超过10万元，请及时审核。',
        wechat: '尊敬的采购经理，供应商{{供应商名称}}提交的报价金额为{{报价金额}}元，已超过10万元，请及时审核。',
        email: '',
      },
    },
    {
      id: 'rule-2',
      name: '审批通过通知',
      description: '审批通过后通知供应商',
      enabled: true,
      triggerField: 'approval_status',
      triggerCondition: 'equals',
      triggerValue: '已通过',
      recipientType: 'phone',
      recipientPhones: '13800138000,13900139000',
      recipientRole: '',
      channels: { sms: false, wechat: true, email: true },
      messageTemplates: {
        sms: '',
        wechat: '尊敬的{{供应商名称}}，您的入驻申请已通过审批，欢迎您与我们开始合作。提交时间：{{提交时间}}',
        email: '尊敬的{{供应商名称}}，您的入驻申请已通过审批，欢迎您与我们开始合作。提交时间：{{提交时间}}',
      },
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRule, setEditingRule] = useState<NotificationRule | null>(null);

  // 服务配置状态（模拟，实际应从系统配置中读取）
  const [serviceConfig] = useState({
    smsConfigured: true,
    wechatConfigured: true,
    emailConfigured: false,
  });

  const handleToggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      setRules(prev => prev.filter(rule => rule.id !== ruleId));
    }
  };

  const handleEditRule = (rule: NotificationRule) => {
    setEditingRule(rule);
    setShowAddModal(true);
  };

  const handleSaveRule = (rule: NotificationRule) => {
    if (editingRule) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    } else {
      setRules(prev => [...prev, { ...rule, id: `rule-${Date.now()}` }]);
    }
    setShowAddModal(false);
    setEditingRule(null);
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      equals: '等于',
      not_equals: '不等于',
      contains: '包含',
      greater: '大于',
      less: '小于',
      greater_or_equal: '大于等于',
      less_or_equal: '小于等于',
    };
    return labels[condition] || condition;
  };

  const getFieldName = (fieldId: string) => {
    return formFields.find(f => f.id === fieldId)?.name || fieldId;
  };

  const getRoleName = (roleId: string) => {
    return roleList.find(r => r.id === roleId)?.name || roleId;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-slate-900">通知规则配置</h2>
          </div>
          <p className="text-sm text-slate-600 mt-1">基于表单字段状态变化自动触发通知</p>
        </div>
        <button
          onClick={() => {
            setEditingRule(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新增触发规则
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:border-slate-300 transition-all"
          >
            {/* Rule Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-slate-900">{rule.name}</h3>
                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleRule(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                  <span className={`text-xs px-2 py-1 rounded-full ${rule.enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {rule.enabled ? '已启用' : '已禁用'}
                  </span>
                </div>
                {rule.description && (
                  <p className="text-xs text-slate-500 mt-1">{rule.description}</p>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditRule(rule)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="编辑"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Rule Details */}
            <div className="space-y-3">
              {/* Trigger Condition */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">触发条件：</div>
                <div className="col-span-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded">
                      {getFieldName(rule.triggerField)}
                    </span>
                    <span className="text-slate-500">{getConditionLabel(rule.triggerCondition)}</span>
                    <code className="px-2 py-1 bg-slate-100 text-slate-800 text-sm rounded font-mono">
                      {rule.triggerValue}
                    </code>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">接收对象：</div>
                <div className="col-span-10 text-sm text-slate-800">
                  {rule.recipientType === 'phone' ? (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-sm rounded">指定手机号</span>
                      <span className="text-slate-600">{rule.recipientPhones}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-sm rounded">指定角色</span>
                      <span className="text-slate-600">{getRoleName(rule.recipientRole)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Channels */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">通知渠道：</div>
                <div className="col-span-10 flex items-center gap-2">
                  {rule.channels.sms && (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">短信</span>
                  )}
                  {rule.channels.wechat && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">微信</span>
                  )}
                  {rule.channels.email && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">邮件</span>
                  )}
                </div>
              </div>

              {/* Message Template Preview */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-2 text-sm text-slate-600">消息模板：</div>
                <div className="col-span-10">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-sm text-slate-700">
                    {rule.channels.sms && rule.messageTemplates.sms ? rule.messageTemplates.sms :
                     rule.channels.wechat && rule.messageTemplates.wechat ? rule.messageTemplates.wechat :
                     rule.channels.email && rule.messageTemplates.email ? rule.messageTemplates.email : '未配置'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {rules.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-12">
          <div className="text-center text-slate-400">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">暂无通知规则</h3>
            <p className="text-sm mb-4">点击"新增触发规则"创建您的第一条通知规则</p>
            <button
              onClick={() => {
                setEditingRule(null);
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              新增触发规则
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <NotificationRuleModal
          rule={editingRule}
          onClose={() => {
            setShowAddModal(false);
            setEditingRule(null);
          }}
          onSave={handleSaveRule}
          serviceConfig={serviceConfig}
        />
      )}
    </div>
  );
}

// Modal Component
function NotificationRuleModal({
  rule,
  onClose,
  onSave,
  serviceConfig,
}: {
  rule: NotificationRule | null;
  onClose: () => void;
  onSave: (rule: NotificationRule) => void;
  serviceConfig: { smsConfigured: boolean; wechatConfigured: boolean; emailConfigured: boolean };
}) {
  const [formData, setFormData] = useState<NotificationRule>(
    rule || {
      id: '',
      name: '',
      description: '',
      enabled: true,
      triggerField: '',
      triggerCondition: 'equals',
      triggerValue: '',
      recipientType: 'role',
      recipientPhones: '',
      recipientRole: '',
      channels: { sms: false, wechat: false, email: false },
      messageTemplates: {
        sms: '',
        wechat: '',
        email: '',
      },
    }
  );

  const [showPreview, setShowPreview] = useState(false);
  const [previewChannel, setPreviewChannel] = useState<'sms' | 'wechat' | 'email'>('sms');

  // 获取当前选中字段的类型
  const selectedFieldType = formFields.find(f => f.id === formData.triggerField)?.type || 'text';

  // 根据字段类型获取可用的条件选项 (BR-6.1)
  const getAvailableConditions = () => {
    if (selectedFieldType === 'number') {
      return [
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' },
        { value: 'greater', label: '大于' },
        { value: 'less', label: '小于' },
        { value: 'greater_or_equal', label: '大于等于' },
        { value: 'less_or_equal', label: '小于等于' },
      ];
    } else {
      return [
        { value: 'equals', label: '等于' },
        { value: 'not_equals', label: '不等于' },
        { value: 'contains', label: '包含' },
      ];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证
    if (!formData.triggerField) {
      alert('请选择触发字段');
      return;
    }
    if (!formData.triggerValue) {
      alert('请填写触发值');
      return;
    }
    if (formData.recipientType === 'phone' && !formData.recipientPhones) {
      alert('请输入至少一个手机号');
      return;
    }
    if (formData.recipientType === 'role' && !formData.recipientRole) {
      alert('请选择角色');
      return;
    }
    if (!formData.channels.sms && !formData.channels.wechat && !formData.channels.email) {
      alert('请至少选择一个通知渠道');
      return;
    }
    
    // 验证手机号格式
    if (formData.recipientType === 'phone') {
      const phones = formData.recipientPhones.split(',').map(p => p.trim());
      if (phones.length > 20) {
        alert('手机号数量不能超过20个');
        return;
      }
      const invalidPhones = phones.filter(p => !/^1[3-9]\d{9}$/.test(p));
      if (invalidPhones.length > 0) {
        alert(`以下手机号格式不正确：${invalidPhones.join(', ')}`);
        return;
      }
    }
    
    // 验证模板是否填写
    if (formData.channels.sms && !formData.messageTemplates.sms) {
      alert('请填写短信消息模板');
      return;
    }
    if (formData.channels.wechat && !formData.messageTemplates.wechat) {
      alert('请填写微信消息模板');
      return;
    }
    if (formData.channels.email && !formData.messageTemplates.email) {
      alert('请填写邮件消息模板');
      return;
    }
    
    onSave(formData);
  };

  const insertVariable = (variable: string, channel: 'sms' | 'wechat' | 'email') => {
    setFormData({
      ...formData,
      messageTemplates: {
        ...formData.messageTemplates,
        [channel]: formData.messageTemplates[channel] + variable
      }
    });
  };

  // 字符计数和分片提示 (BR-6.7)
  const getSmsCharCount = () => {
    const count = formData.messageTemplates.sms.length;
    const segments = Math.ceil(count / 70);
    return { count, segments };
  };

  // 预览功能 (Story 6.3)
  const getPreviewText = () => {
    const template = formData.messageTemplates[previewChannel];
    // 用示例数据替换变量
    return template
      .replace(/{{提交时间}}/g, '2026-03-14 14:30')
      .replace(/{{表单名称}}/g, '供应商入驻表单')
      .replace(/{{供应商名称}}/g, '华强电子有限公司')
      .replace(/{{截止时间}}/g, '2026-03-20 18:00')
      .replace(/{{报价金额}}/g, '125000')
      .replace(/{{报价类型}}/g, '设备采购')
      .replace(/{{审批状态}}/g, '已通过');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between z-10">
          <h2 className="text-lg font-semibold text-slate-900">
            {rule ? '编辑通知规则' : '新增触发规则'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: 基本信息 */}
          <div className="space-y-4">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">1</span>
              基本信息
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                规则名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：高额报价提醒"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                规则描述
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="简要描述这条规则的用途"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Section 2: 触发条件 (Story 6.1) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">2</span>
              触发条件
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  触发字段 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.triggerField}
                  onChange={(e) => setFormData({ ...formData, triggerField: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">选择字段</option>
                  {formFields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  条件 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.triggerCondition}
                  onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {getAvailableConditions().map((cond) => (
                    <option key={cond.value} value={cond.value}>
                      {cond.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  触发值 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.triggerValue}
                  onChange={(e) => setFormData({ ...formData, triggerValue: e.target.value })}
                  placeholder="输入触发值"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                💡 提示：{selectedFieldType === 'number' ? '数值型字段支持所有比较条件' : '文本型字段仅支持等于、不等于、包含条件'}
              </p>
            </div>
          </div>

          {/* Section 3: 发送对象与渠道 (Story 6.2) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">3</span>
              发送对象与渠道
            </h3>
            
            {/* 发送对象类型 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                发送对象类型 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recipientType"
                    value="phone"
                    checked={formData.recipientType === 'phone'}
                    onChange={(e) => setFormData({ ...formData, recipientType: 'phone' })}
                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">指定供应商联系人</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="recipientType"
                    value="role"
                    checked={formData.recipientType === 'role'}
                    onChange={(e) => setFormData({ ...formData, recipientType: 'role' })}
                    className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">指定内部人员角色</span>
                </label>
              </div>
            </div>

            {/* 指定手机号 */}
            {formData.recipientType === 'phone' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  手机号列表 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.recipientPhones}
                  onChange={(e) => setFormData({ ...formData, recipientPhones: e.target.value })}
                  placeholder="输入手机号，多个手机号用逗号分隔，例如：13800138000,13900139000"
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">
                  最多支持20个手机号，用逗号分隔
                </p>
              </div>
            )}

            {/* 指定角色 */}
            {formData.recipientType === 'role' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  选择角色 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.recipientRole}
                  onChange={(e) => setFormData({ ...formData, recipientRole: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">选择角色</option>
                  {roleList.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  将发送给该应用内所有拥有此角色的用户
                </p>
              </div>
            )}

            {/* 通知渠道 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                通知渠道 <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className={`flex items-center gap-2 ${!serviceConfig.smsConfigured ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.channels.sms}
                    onChange={(e) => setFormData({
                      ...formData,
                      channels: { ...formData.channels, sms: e.target.checked }
                    })}
                    disabled={!serviceConfig.smsConfigured}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">短信 (P0)</span>
                  {!serviceConfig.smsConfigured && (
                    <a href="#" className="text-xs text-blue-600 hover:underline">去配置</a>
                  )}
                </label>
                <label className={`flex items-center gap-2 ${!serviceConfig.wechatConfigured ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.channels.wechat}
                    onChange={(e) => setFormData({
                      ...formData,
                      channels: { ...formData.channels, wechat: e.target.checked }
                    })}
                    disabled={!serviceConfig.wechatConfigured}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">微信</span>
                  {!serviceConfig.wechatConfigured && (
                    <a href="#" className="text-xs text-blue-600 hover:underline">去配置</a>
                  )}
                </label>
                <label className={`flex items-center gap-2 ${!serviceConfig.emailConfigured ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData.channels.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      channels: { ...formData.channels, email: e.target.checked }
                    })}
                    disabled={!serviceConfig.emailConfigured}
                    className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">邮件 (P1)</span>
                  {!serviceConfig.emailConfigured && (
                    <a href="#" className="text-xs text-blue-600 hover:underline">去配置</a>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Section 4: 通知文案 (Story 6.3) */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="font-medium text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">4</span>
              通知文案
            </h3>

            {/* 短信模板 */}
            {formData.channels.sms && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    短信消息模板 <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs ${getSmsCharCount().count > 70 ? 'text-orange-600' : 'text-slate-500'}`}>
                    {getSmsCharCount().count} 字
                    {getSmsCharCount().count > 70 && ` (将拆分为 ${getSmsCharCount().segments} 条短信发送)`}
                  </span>
                </div>
                <textarea
                  value={formData.messageTemplates.sms}
                  onChange={(e) => setFormData({ ...formData, messageTemplates: { ...formData.messageTemplates, sms: e.target.value } })}
                  placeholder="输入短信消息模板，支持使用动态变量..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <div className="mt-2">
                  <p className="text-xs text-slate-600 mb-1.5">系统内置变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {systemVariables.map((variable) => (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() => insertVariable(variable.key, 'sms')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors"
                        title={variable.description}
                      >
                        {variable.key}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">表单字段变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formFields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => insertVariable(`{{${field.name}}}`, 'sms')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded transition-colors"
                      >
                        {`{{${field.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                {getSmsCharCount().count > 70 && (
                  <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                    <p className="text-xs text-orange-800">
                      ⚠️ 短信内容超过70字，将自动拆分为{getSmsCharCount().segments}条短信发送，每条费用独立计费
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 微信模板 */}
            {formData.channels.wechat && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  微信消息模板 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.messageTemplates.wechat}
                  onChange={(e) => setFormData({ ...formData, messageTemplates: { ...formData.messageTemplates, wechat: e.target.value } })}
                  placeholder="输入微信消息模板，支持使用动态变量..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <div className="mt-2">
                  <p className="text-xs text-slate-600 mb-1.5">系统内置变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {systemVariables.map((variable) => (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() => insertVariable(variable.key, 'wechat')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors"
                        title={variable.description}
                      >
                        {variable.key}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">表单字段变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formFields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => insertVariable(`{{${field.name}}}`, 'wechat')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded transition-colors"
                      >
                        {`{{${field.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 邮件模板 */}
            {formData.channels.email && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  邮件消息模板 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.messageTemplates.email}
                  onChange={(e) => setFormData({ ...formData, messageTemplates: { ...formData.messageTemplates, email: e.target.value } })}
                  placeholder="输入邮件消息模板，支持使用动态变量..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
                <div className="mt-2">
                  <p className="text-xs text-slate-600 mb-1.5">系统内置变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {systemVariables.map((variable) => (
                      <button
                        key={variable.key}
                        type="button"
                        onClick={() => insertVariable(variable.key, 'email')}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded transition-colors"
                        title={variable.description}
                      >
                        {variable.key}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 mb-1.5">表单字段变量（点击插入）：</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formFields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => insertVariable(`{{${field.name}}}`, 'email')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs rounded transition-colors"
                      >
                        {`{{${field.name}}}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 预览按钮 */}
            {(formData.channels.sms || formData.channels.wechat || formData.channels.email) && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    // 设置默认预览渠道
                    if (formData.channels.sms) setPreviewChannel('sms');
                    else if (formData.channels.wechat) setPreviewChannel('wechat');
                    else if (formData.channels.email) setPreviewChannel('email');
                    setShowPreview(true);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  预览通知内容
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {rule ? '保存规则' : '创建规则'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={() => setShowPreview(false)}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">消息预览</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* 渠道选择 */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                {formData.channels.sms && (
                  <button
                    onClick={() => setPreviewChannel('sms')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${previewChannel === 'sms' ? 'bg-orange-100 text-orange-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    短信
                  </button>
                )}
                {formData.channels.wechat && (
                  <button
                    onClick={() => setPreviewChannel('wechat')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${previewChannel === 'wechat' ? 'bg-green-100 text-green-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    微信
                  </button>
                )}
                {formData.channels.email && (
                  <button
                    onClick={() => setPreviewChannel('email')}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${previewChannel === 'email' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}
                  >
                    邮件
                  </button>
                )}
              </div>

              {/* 预览内容 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {getPreviewText()}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  💡 预览使用示例数据替换变量，实际发送时将使用真实表单数据
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
