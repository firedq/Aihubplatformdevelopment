import { useState } from 'react';
import { Play, Link, Code, Smartphone, Monitor, MessageSquare } from 'lucide-react';
import { FormPreview } from './FormPreview';

export function RuntimeEngine({ forms }: { forms: any[] }) {
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);

  if (forms.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
        <div className="text-center text-slate-400">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">暂无可用表单</h3>
          <p className="text-sm">请先在"设计态"中生成表单，然后在此运行和测试</p>
        </div>
      </div>
    );
  }

  const generateH5Url = (formId: string) => {
    return `https://ai-bridge.example.com/form/${formId}`;
  };

  const generateToolDefinition = (form: any) => {
    return {
      type: 'function',
      function: {
        name: form.id,
        description: form.description || form.name,
        parameters: {
          type: 'object',
          properties: form.fields.reduce((acc: any, field: any) => {
            acc[field.id] = {
              type: field.type === 'number' ? 'number' : 'string',
              description: field.label,
            };
            if (field.required) {
              if (!acc.required) acc.required = [];
              acc.required.push(field.id);
            }
            return acc;
          }, {}),
        },
      },
    };
  };

  return (
    <div className="space-y-6">
      {/* Form List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">表单工具库</h2>
          <p className="text-sm text-slate-600 mt-1">选择表单进行运行和集成</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {forms.map((form) => (
              <div
                key={form.id}
                onClick={() => setSelectedForm(form)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedForm?.id === form.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h3 className="font-medium text-slate-900">{form.name}</h3>
                <p className="text-xs text-slate-600 mt-1">{form.description}</p>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className="px-2 py-1 bg-slate-100 rounded">{form.fields.length} 个字段</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{form.source}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Runtime */}
      {selectedForm && (
        <>
          {/* Integration Options */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">集成方式</h2>
              <p className="text-sm text-slate-600 mt-1">选择表单的调用和集成方式</p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* H5 Link */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Link className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-blue-900">H5链接</h3>
                </div>
                <p className="text-xs text-blue-700 mb-3">独立页面访问</p>
                <div className="bg-white p-2 rounded text-xs font-mono break-all">
                  {generateH5Url(selectedForm.id)}
                </div>
                <button className="mt-3 w-full px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                  复制链接
                </button>
              </div>

              {/* Agent Tool */}
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Agent调用</h3>
                </div>
                <p className="text-xs text-purple-700 mb-3">注册为AI工具</p>
                <div className="bg-white p-2 rounded text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Tool Registry</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">已注册</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCode(!showCode)}
                  className="mt-3 w-full px-3 py-1.5 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                >
                  查看Tool定义
                </button>
              </div>

              {/* Embedded Card */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Code className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-green-900">嵌入式卡片</h3>
                </div>
                <p className="text-xs text-green-700 mb-3">聊天窗口渲染</p>
                <div className="bg-white p-2 rounded text-xs">
                  <div>JSON DSL</div>
                  <div className="text-slate-500">动态渲染</div>
                </div>
                <button className="mt-3 w-full px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                  生成卡片代码
                </button>
              </div>
            </div>
          </div>

          {/* Tool Definition Code */}
          {showCode && (
            <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">OpenAPI Tool Definition</h3>
                <button
                  onClick={() => setShowCode(false)}
                  className="text-slate-400 hover:text-white"
                >
                  关闭
                </button>
              </div>
              <pre className="text-sm text-green-400 overflow-x-auto">
                {JSON.stringify(generateToolDefinition(selectedForm), null, 2)}
              </pre>
            </div>
          )}

          {/* Form Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">表单运行预览</h2>
                <p className="text-sm text-slate-600 mt-1">实时测试表单功能</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6 flex justify-center">
              <div
                className={`w-full transition-all ${
                  viewMode === 'mobile' ? 'max-w-sm' : 'max-w-3xl'
                }`}
              >
                <FormPreview config={selectedForm} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
