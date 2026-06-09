import React from 'react';

const CalendarTab = ({ calendarJobs, selectedJob, setSelectedJob }) => {
  if (calendarJobs.length === 0) {
    return <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 font-medium text-sm">Hôm nay bạn không có ca làm việc nào.</div>;
  }

  return (
    <div className="space-y-4">
      {calendarJobs.map(job => (
        <div 
          key={job.id} 
          onClick={() => setSelectedJob({ ...job, origin: 'calendar' })}
          className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm hover:border-emerald-500 hover:shadow-md flex justify-between items-center ${
            selectedJob?.id === job.id ? 'border-2 border-emerald-600 ring-4 ring-emerald-50' : 'border-slate-200'
          }`}
        >
          <div className="space-y-2 pr-4 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">{job.id}</span>
              <span className="text-sm font-bold text-slate-700">{job.time}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">{job.customer}</h4>
            <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
              <span className="material-symbols-outlined text-sm shrink-0 text-slate-400">location_on</span>{job.address}
            </p>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full shrink-0 border ${
            job.status === 'Đang làm việc' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {job.status}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CalendarTab;