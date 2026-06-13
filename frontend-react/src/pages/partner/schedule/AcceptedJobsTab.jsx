import React from 'react';

const AcceptedJobsTab = ({ acceptedJobs, selectedJob, setSelectedJob }) => {
  if (acceptedJobs.length === 0) {
    return <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 font-medium text-sm">Bạn chưa có lịch làm việc nào được nhận hoặc được ghép gần đây.</div>;
  }

  return (
    <div className="space-y-4">
      {acceptedJobs.map(job => (
        <div 
          key={job.id}
          onClick={() => setSelectedJob({ ...job, origin: 'accepted' })}
          className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm hover:border-emerald-500 hover:shadow-md flex justify-between items-center ${
            selectedJob?.id === job.id ? 'border-2 border-emerald-600 ring-4 ring-emerald-50' : 'border-slate-200'
          }`}
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400">Mã đơn hệ thống: {job.id}</span>
            <h4 className="font-bold text-slate-900 text-base">{job.customer}</h4>
            <p className="text-sm font-black text-emerald-600">{job.time}</p>
            <p className="text-xs text-slate-500 line-clamp-1 mt-1">{job.address}</p>
          </div>
          <span className="material-symbols-outlined text-slate-400 text-lg group-hover:text-emerald-600 transition-colors">arrow_forward_ios</span>
        </div>
      ))}
    </div>
  );
};

export default AcceptedJobsTab;