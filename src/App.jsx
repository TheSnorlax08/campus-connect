import React, { useState, useEffect } from 'react';
import { 
  Sparkles, UploadCloud, Calendar, MapPin, CheckCircle, Brain, 
  Users, BookOpen, BarChart3, PenTool, Globe, ChevronRight, Moon, Star, Info, Clock, Trash2, Code2, Trophy, Github
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from './firebase-config';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';

// 1. PASTE YOUR GEMINI API KEY HERE
const genAI = new GoogleGenerativeAI("AIzaSyBjeRfzba4lNRW8b00EZlIsK5I8Jv02kzM");

export default function App() {
  const [activeTab, setActiveTab] = useState('dept'); 
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);

  // --- ATTENDANCE STATE ---
  const [attData, setAttData] = useState({ attended: '', total: '' });
  const [prediction, setPrediction] = useState(null);
  const subjectAttendance = [
    { name: 'MATHEMATICS', att: 15, tot: 20, color: 'bg-green-500' },
    { name: 'AI & ML', att: 12, tot: 20, color: 'bg-red-500' },
    { name: 'DATA STRUCTURES', att: 18, tot: 20, color: 'bg-green-500' }
  ];

  // --- NOTEBOOK STATE ---
  const [notes, setNotes] = useState([{ id: 1, text: "Finish the Hackathon App today!" }]);
  const [newNote, setNewNote] = useState('');

  // --- PROGRESS TRACKER STATE (15 ROWS) ---
  const [habitRows, setHabitRows] = useState([...Array(15)].map((_, i) => ({
    id: i,
    name: i === 0 ? 'Coffee' : i === 1 ? 'Gym' : i === 2 ? 'Coding' : `Protocol ${i + 1}`,
    days: Array(31).fill(false)
  })));

  const toggleHabit = (rowId, dayIdx) => {
    setHabitRows(habitRows.map(r => r.id === rowId ? { ...r, days: r.days.map((d, i) => i === dayIdx ? !d : d) } : r));
  };

  const sleepData = habitRows[0].days.map((_, i) => ({ day: i + 1, hours: Math.floor(Math.random() * (9 - 5 + 1) + 5) }));

  useEffect(() => {
    const q = query(collection(db, "events"), where("isVerified", "==", true));
    return onSnapshot(q, (snapshot) => {
      setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }, []);

  const calculateAttendance = () => {
    const att = parseInt(attData.attended);
    const tot = parseInt(attData.total);
    if (!att || !tot) return;
    const pct = (att / tot) * 100;
    const canMiss = Math.floor((att / 0.75) - tot);
    setPrediction({ percent: pct.toFixed(1), status: pct < 75 ? 'Critical' : 'Safe', canMiss: canMiss > 0 ? canMiss : 0 });
  };

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-900 font-sans">
      
      {/* SIDEBAR - DEEP NAVY BLUE */}
      <aside className="w-72 bg-[#10172a] flex flex-col p-6 sticky top-0 h-screen z-20 shadow-2xl">
        <div className="flex items-center gap-2 font-black text-2xl text-white mb-10 tracking-tighter uppercase italic">
          <Sparkles fill="#6366f1" className="text-indigo-400" /> CAMPUS CONNECT
        </div>
        
        <nav className="space-y-3 flex-1">
          <SidebarButton icon={<Users size={20}/>} label="Clubs & Culture" active={activeTab === 'clubs'} onClick={() => setActiveTab('clubs')} />
          <SidebarButton icon={<BookOpen size={20}/>} label="Dept. Channels" active={activeTab === 'dept'} onClick={() => setActiveTab('dept')} />
          <SidebarButton icon={<BarChart3 size={20}/>} label="My Progress" active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} />
          <SidebarButton icon={<PenTool size={20}/>} label="Notebook & Tasks" active={activeTab === 'notebook'} onClick={() => setActiveTab('notebook')} />
          <SidebarButton icon={<Globe size={20}/>} label="Developer Tracker" active={activeTab === 'dev'} onClick={() => setActiveTab('dev')} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 z-10 relative overflow-y-auto">
        <header className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight capitalize">{activeTab} Hub</h1>
            <p className="text-slate-500 font-medium italic">Welcome Aditi. Systems are operational.</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-white flex items-center gap-4">
             <div className="text-right">
               <p className="text-xs font-black text-slate-400">JAN 03, 2026</p>
               <p className="text-xs font-bold text-green-500 uppercase tracking-widest underline underline-offset-4">78% ATTENDANCE</p>
             </div>
             <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-300 flex items-center justify-center text-white font-bold">AD</div>
          </div>
        </header>

        {/* CLUBS TAB */}
        {activeTab === 'clubs' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="bg-white border-2 border-dashed border-indigo-200 rounded-[2.5rem] p-12 text-center mb-10 shadow-sm relative z-10">
              <UploadCloud size={48} className="mx-auto text-indigo-400 mb-4" />
              <h2 className="text-xl font-bold">Club Poster AI Scan</h2>
              <input type="file" id="club-up" hidden />
              <label htmlFor="club-up" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold cursor-pointer hover:bg-indigo-700 transition-all inline-block mt-4 shadow-xl">Upload Poster</label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <GradientEventCard title="Campus AI Hackathon 2026" venue="Innovation Hub - Room 402" category="TECH" />
              <GradientEventCard title="National AI Summit" venue="Main Auditorium" category="TECH" />
              <GradientEventCard title="Music & Cultural Fest" venue="Campus Grounds" category="CULTURAL" />
            </div>
          </div>
        )}

        {/* DEPT TAB */}
        {activeTab === 'dept' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10">
            {/* Subject Attendance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {subjectAttendance.map(s => (
                <div key={s.name} className="bg-white p-6 rounded-[2rem] shadow-sm border border-white">
                  <p className="text-[10px] font-black text-slate-400 mb-1">{s.name}</p>
                  <div className="flex justify-between items-end">
                    <h4 className={`text-3xl font-black ${s.att/s.tot < 0.75 ? 'text-red-500' : 'text-green-500'}`}>{Math.round((s.att/s.tot)*100)}%</h4>
                    <p className="text-[10px] font-bold text-slate-400">{s.att}/{s.tot} Classes</p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 mt-4 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color}`} style={{ width: `${(s.att/s.tot)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
              <div className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                 <h3 className="text-xl font-bold mb-6 italic tracking-tight">Predict Attendance Risk</h3>
                 <div className="flex gap-4 mb-6">
                   <input type="number" placeholder="Attended" className="w-full bg-white/10 p-4 rounded-2xl border-none text-white outline-none" onChange={(e)=>setAttData({...attData, attended: e.target.value})} />
                   <input type="number" placeholder="Total" className="w-full bg-white/10 p-4 rounded-2xl border-none text-white outline-none" onChange={(e)=>setAttData({...attData, total: e.target.value})} />
                   <button onClick={calculateAttendance} className="bg-indigo-600 px-8 rounded-2xl font-bold hover:bg-indigo-500 transition-all">Predict</button>
                 </div>
                 {prediction && (
                   <div className={`p-4 rounded-2xl border font-bold ${prediction.status === 'Critical' ? 'bg-red-500/20 text-red-400 border-red-500' : 'bg-green-500/20 text-green-400 border-green-500'}`}>
                      {prediction.percent}% - {prediction.status === 'Critical' ? "⚠️ Submission Warning!" : `✅ Safe: Miss ${prediction.canMiss} classes.`}
                   </div>
                 )}
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-white flex flex-col justify-center">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Legend</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-red-500"><div className="w-3 h-3 rounded-full bg-red-500"/> CRITICAL (DUE SOON)</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-green-500"><div className="w-3 h-3 rounded-full bg-green-500"/> SAFE</div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-400"><div className="w-3 h-3 rounded-full bg-slate-200"/> SUBMITTED</div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-black mb-6 italic">Submission Deadlines</h2>
            <div className="flex flex-col gap-4 max-w-2xl">
              <VerticalDeadlineCard title="Mathematics Project" date="JAN 05" color="red" sub="Calculus" />
              <VerticalDeadlineCard title="AI Ethics Research" date="JAN 12" color="green" sub="ML" />
              <VerticalDeadlineCard title="DS Lab Task #12" date="DEC 28" color="grey" sub="Data Structures" status="Submitted" />
            </div>
          </div>
        )}

        {/* PROGRESS TAB */}
        {activeTab === 'progress' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white mb-8 overflow-x-auto">
              <h2 className="text-2xl font-black mb-6 tracking-tighter uppercase">31 Day Habit Dashboard</h2>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 border text-[10px] uppercase font-black text-slate-400">Protocols</th>
                    {[...Array(31)].map((_, i) => <th key={i} className="p-1 border text-[9px] text-center w-8 font-bold">{i + 1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {habitRows.map(row => (
                    <tr key={row.id}>
                      <td className="p-2 border"><input type="text" value={row.name} onChange={(e)=>{const n=[...habitRows]; n[row.id].name=e.target.value; setHabitRows(n);}} className="bg-transparent border-none text-[11px] font-black text-indigo-600 w-full focus:ring-0 outline-none" /></td>
                      {row.days.map((done, i) => (
                        <td key={i} className="p-1 border text-center cursor-pointer hover:bg-indigo-50" onClick={()=>{const n=[...habitRows]; n[row.id].days[i]=!done; setHabitRows(n);}}>
                          {done ? <div className="w-4 h-4 bg-indigo-600 rounded-sm mx-auto flex items-center justify-center text-[8px] text-white">X</div> : <div className="w-4 h-4 bg-slate-100 rounded-sm mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="bg-indigo-50/50">
                      <td className="p-3 border font-black text-[10px] text-indigo-900 italic">DAILY TOTAL</td>
                      {[...Array(31)].map((_, i) => (
                        <td key={i} className="p-1 border text-center font-black text-[10px] text-indigo-600">
                          {habitRows.reduce((acc, row) => acc + (row.days[i] ? 1 : 0), 0)}
                        </td>
                      ))}
                    </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl h-64 border border-white">
               <h4 className="font-bold mb-4 flex items-center gap-2"><Moon size={16} className="text-indigo-500"/> Sleep Rhythm tracking</h4>
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sleepData}><XAxis dataKey="day" hide /><YAxis domain={[5, 10]} hide /><Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={4} dot={false} /></LineChart>
               </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* NOTEBOOK TAB */}
        {activeTab === 'notebook' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex justify-center relative z-10">
            <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl flex border-l-[40px] border-[#334155] min-h-[500px]">
              <div className="absolute left-[-25px] top-0 bottom-0 flex flex-col justify-around py-4">
                {[...Array(10)].map((_, i) => <div key={i} className="w-10 h-2.5 bg-slate-300 rounded-full shadow-inner border border-slate-400" />)}
              </div>
              <div className="flex-1 p-12 relative overflow-hidden">
                 <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '100% 2.5rem' }} />
                 <div className="relative z-10">
                   <h2 className="text-2xl font-black mb-8 underline decoration-red-200 decoration-4 italic">Aditi's Notebook</h2>
                   <div className="flex gap-4 mb-8">
                     <input type="text" value={newNote} onChange={(e)=>setNewNote(e.target.value)} className="flex-1 bg-transparent border-b-2 border-slate-200 outline-none font-bold" placeholder="Write a task..." />
                     <button onClick={()=>{if(newNote){setNotes([{id:Date.now(), text:newNote}, ...notes]); setNewNote('');}}} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-lg">Save</button>
                   </div>
                   <div className="space-y-4">
                     {notes.map(n => <p key={n.id} className="text-xl italic text-slate-700 font-medium tracking-tight">✏️ {n.text}</p>)}
                   </div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* DEV TRACKER TAB - NO LONGER BLANK */}
        {activeTab === 'dev' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-50 rounded-2xl text-orange-500"><Code2 size={24}/></div>
                <div><h4 className="font-black text-xl">LeetCode</h4><p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">245 Solved</p></div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs text-slate-500">• Enrolled: Biweekly Contest 102</p>
                <p className="text-xs text-slate-500">• Solved: 15 Hard Today</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-900"><Github size={24}/></div>
                <div><h4 className="font-black text-xl">GitHub</h4><p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">12 Repos</p></div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs text-slate-500">• Commits: 45 this week</p>
                <p className="text-xs text-slate-500">• Status: Active Repository</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-2xl text-blue-500"><Trophy size={24}/></div>
                <div><h4 className="font-black text-xl">Unstop</h4><p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">3 Badges</p></div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs text-slate-500">• Applied: Google Hackathon</p>
                <p className="text-xs text-slate-500">• Rank: College #3</p>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-red-50 rounded-2xl text-red-500"><Clock size={24}/></div>
                <div><h4 className="font-black text-xl">CodeChef</h4><p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">3 Star</p></div>
              </div>
              <div className="mt-4 pt-4 border-t space-y-2">
                <p className="text-xs text-slate-500">• Rating: 1642</p>
                <p className="text-xs text-slate-500">• Goal: 4 Star</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB COMPONENTS ---

function SidebarButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-indigo-600 text-white shadow-xl scale-[1.05]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}>
      {icon} <span className="text-[11px] uppercase tracking-wider">{label}</span>
    </button>
  );
}

function GradientEventCard({ title, venue, category }) {
  return (
    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-10 rounded-[2.5rem] text-white shadow-2xl h-[260px] flex flex-col justify-between border-b-8 border-indigo-900">
      <div>
        <span className="text-[10px] font-black bg-white/20 px-3 py-1 rounded-full uppercase tracking-widest">{category}</span>
        <h3 className="text-2xl font-black mt-4 leading-tight">{title}</h3>
      </div>
      <p className="text-xs italic font-bold opacity-70 flex items-center gap-1"><MapPin size={12}/> {venue}</p>
    </div>
  );
}

function VerticalDeadlineCard({ title, date, color, sub, status }) {
  const c = { red: "bg-red-50 text-red-600 border-red-100", green: "bg-green-50 text-green-600 border-green-100", grey: "bg-slate-50 text-slate-400 border-slate-100" };
  return (
    <div className={`flex items-center justify-between p-6 rounded-[2.2rem] border-2 shadow-sm ${c[color]}`}>
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${color==='red'?'bg-red-500':color==='green'?'bg-green-500':'bg-slate-300'}`} />
        <div><p className="text-[9px] font-black uppercase opacity-60 leading-none mb-1 tracking-widest">{sub}</p><h4 className="font-black text-lg">{title}</h4></div>
      </div>
      <p className="text-xs font-black">{status || `DUE: ${date}`}</p>
    </div>
  );
}