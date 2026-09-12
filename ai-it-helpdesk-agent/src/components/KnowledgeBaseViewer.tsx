import React, { useState } from 'react';
import { BookOpen, Search, Tag, ExternalLink, ShieldCheck } from 'lucide-react';
import { KnowledgeArticle } from '../types';

interface KnowledgeBaseViewerProps {
  knowledgeBase: KnowledgeArticle[];
}

export const KnowledgeBaseViewer: React.FC<KnowledgeBaseViewerProps> = ({ knowledgeBase }) => {
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle>(knowledgeBase[0]);
  const [filterText, setFilterText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(knowledgeBase.flatMap(k => k.tags)));

  const filteredArticles = knowledgeBase.filter(article => {
    const matchesFilter = filterText === '' ||
      article.title.toLowerCase().includes(filterText.toLowerCase()) ||
      article.content.toLowerCase().includes(filterText.toLowerCase());
    const matchesTag = !selectedTag || article.tags.includes(selectedTag);
    return matchesFilter && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>IT Knowledge Base & Standard Operating Procedures (RAG)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Internal corporate technical documentation indexed for semantic retrieval by Tool 2 (`search_knowledge_base`).
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search IT SOPs & policies..."
            className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-slate-400 mr-1 flex items-center">
          <Tag className="w-3 h-3 mr-1" /> Tags:
        </span>
        <button
          onClick={() => setSelectedTag(null)}
          className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
            selectedTag === null ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Tags
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Layout: Articles list + Detail view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column: Articles */}
        <div className="md:col-span-1 space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {filteredArticles.map(article => {
            const isSelected = selectedArticle.id === article.id;
            return (
              <div
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-blue-600">{article.id}</span>
                  <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{article.category}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2">{article.title}</h4>
                <div className="flex flex-wrap gap-1 mt-2">
                  {article.tags.slice(0, 3).map(t => (
                    <span key={t} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: Selected Article Content */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col h-[600px] overflow-y-auto">
          <div className="border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono">
                {selectedArticle.id}
              </span>
              <span className="text-slate-500 font-medium">{selectedArticle.category}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">{selectedArticle.title}</h2>
            <div className="flex items-center space-x-1 mt-2">
              {selectedArticle.tags.map(t => (
                <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  #{t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex-1 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-slate-50/60 p-4 rounded-xl border border-slate-100 overflow-y-auto">
            {selectedArticle.content}
          </div>
        </div>
      </div>
    </div>
  );
};
