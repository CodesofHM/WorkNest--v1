import React from 'react';
import { Edit, Layers3, Trash2 } from 'lucide-react';

const TemplateList = ({ templates, loading, onDelete, onEdit }) => {
  if (loading) return <p className="py-10 text-center text-muted-foreground">Loading templates...</p>;
  if (templates.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
        <p className="text-lg font-medium text-slate-900">No templates saved yet</p>
        <p className="mt-2 text-sm text-slate-500">Create reusable pricing packages here and apply them when building proposals.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {templates.map(template => (
        <div key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:bg-white hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ring-1 ring-slate-200">
                <Layers3 className="h-3.5 w-3.5" />
                Reusable
              </div>
              <h4 className="font-semibold text-slate-900">{template.templateName}</h4>
              <p className="mt-2 text-sm text-gray-500">{template.lineItems.length} items ready for proposal reuse</p>
            </div>
            <div className="rounded-2xl bg-violet-50 p-3 text-violet-700">
              <Layers3 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <button onClick={() => onEdit?.(template)} className="inline-flex items-center rounded-full bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100">
              <Edit className="mr-1 h-4 w-4" /> Edit
            </button>
            <button onClick={() => onDelete(template)} className="inline-flex items-center rounded-full bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100">
              <Trash2 className="mr-1 h-4 w-4" /> Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemplateList;
