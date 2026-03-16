import { Plus, FileText, Calendar, ExternalLink, MoreVertical, Edit, Copy, Trash2 } from 'lucide-react';

interface FormItem {
  id: string;
  name: string;
  description: string;
  source?: string;
  type: string;
  createTime: string;
  updateTime: string;
  published: boolean;
  fields?: any[];
}

export function DesignHome({
  forms,
  onNew,
  onEdit,
  onPublish,
  onDuplicate,
  onDelete,
}: {
  forms: FormItem[];
  onNew: () => void;
  onEdit: (formId: string) => void;
  onPublish: (formId: string) => void;
  onDuplicate: (formId: string) => void;
  onDelete: (formId: string) => void;
}) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">我的表单</h2>
          <p className="text-sm text-slate-600 mt-1">共 {forms.length} 个表单</p>
        </div>
        <button
          onClick={onNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建表单
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {forms.map((form) => (
          <div
            key={form.id}
            className="bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="font-medium text-slate-900">{form.name}</h3>
                  </div>
                  {form.description && (
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{form.description}</p>
                  )}
                </div>
                <div className="relative group/menu">
                  <button className="p-1 hover:bg-slate-100 rounded transition-colors">
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                  </button>
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all z-10">
                    <button
                      onClick={() => onEdit(form.id)}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      编辑
                    </button>
                    <button
                      onClick={() => onDuplicate(form.id)}
                      className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Copy className="w-3 h-3" />
                      复制
                    </button>
                    <button
                      onClick={() => onDelete(form.id)}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  </div>
                </div>
              </div>

              {/* Source Badge */}
              {form.source && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                    已对接: {form.source}
                  </span>
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="p-4">
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>更新于 {form.updateTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>{form.fields?.length || 0} 个字段</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3">
                {form.published ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    已发布
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    草稿
                  </span>
                )}
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 rounded-b-lg flex items-center gap-2">
              <button
                onClick={() => onEdit(form.id)}
                className="flex-1 px-3 py-1.5 text-sm text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
              >
                编辑表单
              </button>
              <button
                onClick={() => onPublish(form.id)}
                className="flex-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                发布
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {forms.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">还没有表单</h3>
              <p className="text-sm text-slate-600 mb-4">点击"新建表单"开始创建您的第一个表单</p>
              <button
                onClick={onNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建表单
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
