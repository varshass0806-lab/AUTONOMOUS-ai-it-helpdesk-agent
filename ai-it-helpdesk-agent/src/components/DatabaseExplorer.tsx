import React, { useState } from 'react';
import { Database, Search, Filter, ShieldCheck, Users, Ticket, FileText } from 'lucide-react';
import { Employee, ITTicket, SystemLog } from '../types';

interface DatabaseExplorerProps {
  employees: Employee[];
  tickets: ITTicket[];
  logs: SystemLog[];
}

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  employees,
  tickets,
  logs
}) => {
  const [activeTable, setActiveTable] = useState<'employees' | 'it_tickets' | 'system_logs'>('employees');
  const [searchFilter, setSearchFilter] = useState('');

  const getFilteredData = () => {
    const q = searchFilter.toLowerCase();
    if (activeTable === 'employees') {
      return employees.filter(e => 
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.laptop_asset_tag.toLowerCase().includes(q)
      );
    } else if (activeTable === 'it_tickets') {
      return tickets.filter(t => 
        t.ticket_id.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.employee_name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    } else {
      return logs.filter(l => 
        l.event_type.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q)
      );
    }
  };

  const filteredData = getFilteredData();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>SQLite Database Inspector (`helpdesk.db`)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse and query live records preloaded via `setup_db.py`. Modified dynamically during ReAct agent executions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter current table..."
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 w-60"
            />
          </div>
        </div>
      </div>

      {/* Table Selector Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTable('employees'); setSearchFilter(''); }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors ${
            activeTable === 'employees'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>employees ({employees.length})</span>
        </button>

        <button
          onClick={() => { setActiveTable('it_tickets'); setSearchFilter(''); }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors ${
            activeTable === 'it_tickets'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>it_tickets ({tickets.length})</span>
        </button>

        <button
          onClick={() => { setActiveTable('system_logs'); setSearchFilter(''); }}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-colors ${
            activeTable === 'system_logs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>system_logs ({logs.length})</span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {activeTable === 'employees' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Workstation Tag</th>
                  <th className="p-3">OS</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredData.map((emp: any) => (
                  <tr key={emp.employee_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-600">{emp.employee_id}</td>
                    <td className="p-3 font-semibold text-slate-900">{emp.name}</td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">{emp.email}</td>
                    <td className="p-3 text-slate-700">{emp.department}</td>
                    <td className="p-3 text-slate-500">{emp.role}</td>
                    <td className="p-3 font-mono text-slate-800 text-[11px] bg-slate-50/50">{emp.laptop_asset_tag}</td>
                    <td className="p-3 text-slate-600 text-[11px]">{emp.os}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'it_tickets' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="p-3">Ticket ID</th>
                  <th className="p-3">Title & Category</th>
                  <th className="p-3">Requester</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Assigned Team</th>
                  <th className="p-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((tkt: any) => (
                  <tr key={tkt.ticket_id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-600">{tkt.ticket_id}</td>
                    <td className="p-3 max-w-sm">
                      <div className="font-semibold text-slate-900">{tkt.title}</div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-1">
                        {tkt.category}
                      </span>
                      <span className="text-[10px] text-slate-500">{tkt.description?.slice(0, 60)}...</span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{tkt.employee_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tkt.employee_id}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        tkt.priority.includes('P1') ? 'bg-rose-100 text-rose-800' :
                        tkt.priority.includes('P2') ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                        tkt.status === 'Open' ? 'bg-amber-100 text-amber-800' :
                        tkt.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {tkt.status}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{tkt.assigned_team}</td>
                    <td className="p-3 font-mono text-[10px] text-slate-500">{tkt.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTable === 'system_logs' && (
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] font-sans">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Details</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                    <td className="p-3 font-bold text-slate-800">{log.event_type}</td>
                    <td className="p-3 text-blue-600 font-semibold">{log.actor}</td>
                    <td className="p-3 text-slate-700 max-w-md font-sans text-xs">{log.details}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        log.severity === 'WARN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3 text-emerald-600 font-semibold">{log.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
