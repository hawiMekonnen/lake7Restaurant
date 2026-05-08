import React, { useState, useEffect } from 'react';
import { 
  Star, 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  User,
  Quote
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Feedback as FeedbackType } from '../types';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState<FeedbackType[]>([]);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFeedbacks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FeedbackType)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'feedback'));
    return unsubscribe;
  }, []);

  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1) 
    : '0.0';

  const filteredFeedbacks = filterRating === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.rating === filterRating);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        <div className="card p-8 flex flex-col items-center justify-center text-center">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">Overall Score</h3>
            <div className="text-6xl font-black text-text-main mb-2 leading-none drop-shadow-sm">{averageRating}</div>
            <div className="flex gap-1.5 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={cn("w-5 h-5", s <= Math.round(Number(averageRating)) ? "fill-amber-400 text-amber-400" : "text-slate-100")} />
              ))}
            </div>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-tighter">Verified data from {feedbacks.length} receipts</p>
        </div>

        <div className="card p-8 flex flex-col justify-center">
           <h3 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-6 px-1">Satisfaction Breakdown</h3>
           <div className="space-y-4">
             {[5, 4, 3, 2, 1].map((r) => {
               const count = feedbacks.filter(f => f.rating === r).length;
               const percentage = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0;
               return (
                 <div key={r} className="flex items-center gap-4 group">
                    <div className="flex items-center gap-1 w-8">
                       <span className="text-[11px] font-black text-text-main">{r}</span>
                       <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                       <div className="h-full bg-primary rounded-full group-hover:bg-[#1e40af] transition-colors" style={{width: `${percentage}%`}}></div>
                    </div>
                    <span className="text-[10px] font-black text-text-muted w-10 text-right opacity-60 leading-none">{count}</span>
                 </div>
               );
             })}
           </div>
        </div>
      </div>

      {/* Filter & List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {[5, 4, 3, 2, 'all'].map((r) => (
              <button 
                key={r}
                onClick={() => setFilterRating(r as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm shrink-0",
                  filterRating === r ? "bg-slate-900 text-white border-slate-900" : "bg-white text-text-muted border-border hover:border-primary"
                )}
              >
                {r === 'all' ? 'All Reviews' : `${r} Star`}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5 group-focus-within:text-primary transition-colors" />
             <input type="text" placeholder="Search customer sentiment..." className="w-full pl-9 pr-4 py-2.5 text-[11px] font-bold bg-white border border-border rounded-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm shadow-slate-100/50" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredFeedbacks.length === 0 ? (
            <div className="col-span-full py-20 text-center card bg-transparent border-dashed border-2 opacity-50">
               <MessageSquare className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-20" />
               <p className="text-[11px] font-black uppercase tracking-widest text-text-muted">No records found for this segment</p>
            </div>
          ) : (
            filteredFeedbacks.map((f) => (
              <div key={f.id} className="card p-8 relative overflow-hidden group hover:border-primary transition-all active:scale-[0.99] cursor-pointer">
                 <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                    <Quote className="w-24 h-24 rotate-180" />
                 </div>
                 <div className="flex items-center justify-between mb-5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={cn("w-3.5 h-3.5", s <= f.rating ? "fill-amber-400 text-amber-400" : "text-slate-100")} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-tighter opacity-70">
                      {f.createdAt?.seconds ? format(f.createdAt.seconds * 1000, 'MMM d, yyyy') : 'Recently'}
                    </span>
                 </div>
                 <div className="mb-6 min-h-[60px]">
                    <p className="text-text-main font-bold leading-relaxed italic text-sm">
                      <span className="text-primary/30 mr-1 opacity-50">"</span>
                      {f.comment}
                      <span className="text-primary/30 ml-1 opacity-50">"</span>
                    </p>
                 </div>
                 <div className="flex items-center justify-between pt-6 border-t border-border/50">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 rounded-xl bg-slate-50 border border-border flex items-center justify-center shadow-sm">
                          <User className="w-4 h-4 text-text-muted opacity-50" />
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-text-main uppercase tracking-tighter">Order #{f.orderId.slice(0, 6)}</p>
                          <div className="flex items-center gap-1">
                             <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                             <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest opacity-60">Verified Din-in</p>
                          </div>
                       </div>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                       Archive
                    </button>
                 </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
