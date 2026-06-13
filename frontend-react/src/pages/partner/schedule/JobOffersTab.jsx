import React from 'react';

const JobOffersTab = ({ jobOffers, selectedJob, setSelectedJob }) => {
  if (jobOffers.length === 0) {
    return <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-400 font-medium text-sm">Hiện tại không có đề xuất lịch mới nào dành cho bạn.</div>;
  }

  return (
    <div className="space-y-4">
      {jobOffers.map(job => (
        <div 
          key={job.id}
          onClick={() => setSelectedJob({ ...job, origin: 'offers' })}
          className={`p-5 bg-white rounded-2xl border transition-all cursor-pointer shadow-sm hover:border-emerald-500 hover:shadow-md flex justify-between items-center ${
            selectedJob?.id === job.id ? 'border-2 border-emerald-600 ring-4 ring-emerald-50' : 'border-slate-200'
          }`}
        >
          <div className="space-y-2 pr-4 flex-1">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide border ${
                job.type === 'DIRECT' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>
                {job.type === 'DIRECT' ? 'Khách chỉ định' : 'Chợ việc tự do'}
              </span>
              <span className="text-sm font-semibold text-slate-600">{job.time}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base">{job.service}</h4>
            <p className="text-xs text-slate-500 line-clamp-1">{job.address}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-base font-black text-emerald-600">{job.price}</span>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Thu nhập về ví</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobOffersTab;