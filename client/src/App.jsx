import { useState, useEffect, useMemo } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


const SubscriptionLogo = ({ name }) => {
    const [imgError, setImgError] = useState(false);
    const domain = name?.toLowerCase().replace(/\s+/g, '') + '.com';
    const logoUrl = `https://logo.clearbit.com/${domain}?size=80`;

    if (imgError || !name) {
        return (
            <div className="w-12 h-12 bg-gradient-to-br from-rose-50 to-white rounded-2xl flex items-center justify-center text-xl font-bold text-equi-main shadow-inner border border-rose-50">
                {name ? name[0].toUpperCase() : '?'}
            </div>
        );
    }
    return <img src={logoUrl} alt={name} onError={() => setImgError(true)} className="w-12 h-12 rounded-2xl object-contain bg-white shadow-sm border border-rose-50 p-1" />;
};

const shareViaWA = (split) => {
    let msg = `*Tagihan: ${split.title}*\n📅 ${split.date}\n💰 Total: Rp ${parseInt(split.total_amount).toLocaleString('id-ID')}\n\n`;
    split.members.forEach(m => msg += `- ${m.name}: Rp ${parseInt(m.amount).toLocaleString('id-ID')} (${m.is_paid ? "✅" : "❌"})\n`);
    msg += `\nYuk diselesaikan guys! 🌸`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed bottom-5 right-5 ${type==='error'?'bg-red-500':'bg-green-500'} text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-right z-[100]`}>
      <span className="font-bold">{type==='error'?'✕':'✓'}</span><p className="text-sm">{message}</p>
    </div>
  );
};

const AuthPage = ({ onLoginSuccess, showToast }) => {
    const [isReg, setIsReg] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({email:'', pass:'', name:''});

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        const ep = isReg ? '/api/register' : '/api/login';
        try {
            const res = await fetch(`http://localhost:8000${ep}`, {
                method: 'POST', headers: {'Content-Type':'application/json'},
                body: JSON.stringify({email:form.email, password:form.pass, name:isReg?form.name:"User"})
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.detail);
            if(isReg) { showToast("Created! Login now."); setIsReg(false); }
            else { showToast("Welcome!"); onLoginSuccess(data); }
        } catch(err) { showToast(err.message, "error"); } 
        finally { setLoading(false); }
    }
    return (
        <div className="min-h-screen bg-equi-light flex items-center justify-center p-4 font-sans">
            <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-white">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-equi-main to-rose-400 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-rose-200 mb-4">e.</div>
                    <h1 className="text-2xl font-bold text-gray-700 mb-1">{isReg?"Join equi.":"Welcome Back"}</h1>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isReg && <input className="w-full p-3 rounded-xl border outline-none focus:border-equi-main" placeholder="Name" onChange={e=>setForm({...form, name:e.target.value})} required/>}
                    <input className="w-full p-3 rounded-xl border outline-none focus:border-equi-main" type="email" placeholder="Email" onChange={e=>setForm({...form, email:e.target.value})} required/>
                    <input className="w-full p-3 rounded-xl border outline-none focus:border-equi-main" type="password" placeholder="Password" onChange={e=>setForm({...form, pass:e.target.value})} required/>
                    <button disabled={loading} className="w-full bg-gradient-to-r from-equi-main to-rose-400 text-white py-3 rounded-xl font-bold hover:shadow-lg transition transform active:scale-95">{loading?'...':(isReg?'Sign Up':'Sign In')}</button>
                </form>
                <p className="text-center text-xs text-gray-400 mt-6 cursor-pointer hover:text-equi-main font-medium" onClick={()=>setIsReg(!isReg)}>{isReg?"Have account? Login":"New here? Sign Up"}</p>
            </div>
        </div>
    )
}

const CalendarWidget = ({ subs }) => {
    const [date] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(new Date()); 
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const getSubsForDay = (day) => subs.filter(sub => new Date(sub.date).getDate() === day);
    const subsOnSelectedDate = getSubsForDay(selectedDate.getDate());

    return (
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50 h-full flex flex-col animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-700">{monthNames[date.getMonth()]} {date.getFullYear()}</h3>
                <div className="text-xs text-rose-400 font-bold bg-rose-50 px-3 py-1 rounded-full">Schedule</div>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-6 text-center">
                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-xs font-bold text-gray-400">{d}</div>)}
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const hasSub = getSubsForDay(day).length > 0;
                    const isSelected = selectedDate.getDate() === day;
                    return (
                        <div key={day} onClick={() => setSelectedDate(new Date(date.getFullYear(), date.getMonth(), day))}
                            className={`relative h-10 w-10 flex flex-col items-center justify-center rounded-full cursor-pointer transition-all ${isSelected ? 'bg-equi-main text-white shadow-lg scale-110' : 'hover:bg-rose-50 text-gray-600'}`}>
                            <span className="text-sm font-medium">{day}</span>
                            {hasSub && !isSelected && <span className="absolute bottom-1.5 w-1.5 h-1.5 bg-equi-main rounded-full"></span>}
                        </div>
                    )
                })}
            </div>
            <div className="mt-auto bg-equi-light/50 p-4 rounded-2xl border border-rose-100">
                <p className="text-xs text-gray-400 font-bold mb-2 uppercase tracking-wider">{selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}</p>
                {subsOnSelectedDate.length > 0 ? (
                    <div className="space-y-2">
                        {subsOnSelectedDate.map((sub, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2"><SubscriptionLogo name={sub.name}/><span className="text-sm font-bold text-gray-700">{sub.name}</span></div>
                                <span className="text-xs font-bold text-rose-400">Rp {parseInt(sub.cost_for_me || sub.price).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-sm text-gray-400 italic">No payments due.</p>}
            </div>
        </div>
    )
}

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar'); 
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [splits, setSplits] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState(null);
  const [newSub, setNewSub] = useState({name:'', price:'', date:'', type:'Personal'});
  
  
  const [splitTitle, setSplitTitle] = useState('');
  const [splitTotal, setSplitTotal] = useState('');
  const [splitNames, setSplitNames] = useState('');
  const [linkedSubId, setLinkedSubId] = useState(null); 
  const [editingSplitId, setEditingSplitId] = useState(null); 

  useEffect(() => { if(user) { fetchData(); fetchSplits(); fetchAnalytics(); } }, [user]);

  const showToast = (msg, type='success') => setToast({message:msg, type});

  const fetchData = async () => {
    const res = await fetch(`http://localhost:8000/api/subs?email=${user.email}`);
    const data = await res.json();
    setSubs(data);
    setTotal(data.reduce((a,b)=>a+(b.cost_for_me || b.price), 0));
  }

  const fetchSplits = async () => {
    const res = await fetch(`http://localhost:8000/api/splits?email=${user.email}`);
    setSplits(await res.json());
  }

  const fetchAnalytics = async () => {
    const res = await fetch(`http://localhost:8000/api/analytics?email=${user.email}`);
    setAnalyticsData(await res.json());
  }

  const handleDelSub = async (id) => {
    if(!confirm("Hapus?")) return;
    await fetch(`http://localhost:8000/api/subs/${id}`, {method:'DELETE'});
    fetchData(); fetchAnalytics();
  }

  const handleAddSub = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:8000/api/subs', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({...newSub, price:parseInt(newSub.price), owner_email: user.email})
    });
    setShowForm(false); setNewSub({name:'', price:'', date:'', type:'Personal'}); 
    fetchData(); fetchAnalytics(); showToast("Added!");
  }

  const handlePayMonth = async (subId, monthStr) => {
      await fetch(`http://localhost:8000/api/subs/${subId}/pay?month=${monthStr}`, { method: 'PUT' });
      fetchData(); showToast("Marked as Paid!");
  }

  const handleSaveSplit = async () => {
    if(!splitTotal || !splitNames) return showToast("Isi harga & nama teman!", "error");
    const names = splitNames.split(',').map(n => n.trim()).filter(n => n);
    if(names.length === 0) return;
    
    const totalPeople = names.length + 1; 
    const amountPerPerson = Math.ceil(parseInt(splitTotal) / totalPeople);
    
    const payload = {
        title: splitTitle || "Split Bill",
        total_amount: parseInt(splitTotal),
        date: new Date().toISOString().split('T')[0],
        owner_email: user.email, 
        linked_sub_id: linkedSubId, 
        members: [
            ...names.map(name => ({ name: name, amount: amountPerPerson, is_paid: false })),
            { name: "Me", amount: amountPerPerson, is_paid: true } 
        ]
    };

    if (editingSplitId) {
        
        await fetch(`http://localhost:8000/api/splits/${editingSplitId}`, {
            method: 'PUT', headers: {'Content-Type':'application/json'},
            body: JSON.stringify(payload)
        });
        showToast("Split updated!");
    } else {
        await fetch('http://localhost:8000/api/splits', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify(payload)
        });
        showToast("Split saved!");
    }
    
    fetchSplits(); fetchData(); fetchAnalytics();
    setSplitNames(''); setSplitTotal(''); setSplitTitle(''); 
    setLinkedSubId(null); setEditingSplitId(null);
  }


  const handleEditSplit = (split) => {
      setEditingSplitId(split.id);
      setSplitTitle(split.title);
      setSplitTotal(split.total_amount);
      setLinkedSubId(split.linked_sub_id);
      
      const friends = split.members.filter(m => m.name !== "Me").map(m => m.name).join(", ");
      setSplitNames(friends);
      
      window.scrollTo({top:0, behavior:'smooth'});
  }

  const handleTogglePaid = async (splitId, memberIndex) => {
    await fetch(`http://localhost:8000/api/splits/${splitId}/pay/${memberIndex}`, {method:'PUT'});
    fetchSplits();
  }

  const handleDeleteSplit = async (id) => {
      if(!confirm("Hapus history ini? Harga langganan akan balik normal.")) return;
      await fetch(`http://localhost:8000/api/splits/${id}`, {method:'DELETE'});
      fetchSplits(); fetchData(); fetchAnalytics();
  }

  const selectForSplit = (sub) => {
      if (sub.shared_with && sub.shared_with.length > 0) return;
      setActiveTab('split'); setSplitTitle(sub.name); setSplitTotal(sub.price); setLinkedSubId(sub.id); setSplitNames(''); setEditingSplitId(null);
      window.scrollTo({top:0, behavior:'smooth'});
  }

  const chartConfig = useMemo(() => {
    const labels = analyticsData.map(item => item.type);
    const dataValues = analyticsData.map(item => item.total);
    return {
        data: {
            labels: labels,
            datasets: [{ data: dataValues, backgroundColor: ['#FF5E89', '#FBB6CE', '#D6BCFA', '#F687B3', '#ED64A6'], borderColor: '#ffffff', borderWidth: 3 }],
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, font: { family: 'Poppins', size: 12 } } } }, cutout: '65%' }
    };
  }, [analyticsData]);

  if(!user) return <><AuthPage onLoginSuccess={setUser} showToast={showToast}/>{toast && <Toast {...toast} onClose={()=>setToast(null)}/>}</>;

  const currentMonthStr = new Date().toISOString().slice(0, 7); 
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
  const nextMonthStr = nextMonthDate.toLocaleString('default', { month: 'short' });

  return (
    <div className="min-h-screen bg-equi-light font-sans text-gray-600 selection:bg-equi-main selection:text-white pb-20">
      {toast && <Toast {...toast} onClose={()=>setToast(null)}/>}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/70 backdrop-blur-lg border-b border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
                <div className="w-10 h-10 bg-gradient-to-br from-equi-main to-rose-400 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-rose-200 hover:scale-105 transition-transform">e</div>
                <span className="text-2xl font-bold text-gray-800 tracking-tight">equi<span className="text-equi-main">.</span></span>
            </div>
            <div className="flex gap-3 items-center">
                <button onClick={()=>setShowForm(true)} className="hidden md:flex bg-gradient-to-r from-equi-main to-rose-400 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-rose-200/50 hover:scale-105 transition-all items-center gap-2"><span className="text-lg leading-none">+</span> New</button>
                <button onClick={()=>setShowForm(true)} className="md:hidden w-10 h-10 bg-gradient-to-r from-equi-main to-rose-400 text-white rounded-full flex items-center justify-center font-bold shadow-lg active:scale-95 transition">+</button>
                <div onClick={()=>setShowProfile(true)} className="flex items-center gap-3 pl-1 pr-4 py-1 bg-white border border-gray-100 rounded-full shadow-sm hover:shadow-md cursor-pointer transition-all group">
                    <div className="w-9 h-9 bg-gradient-to-tr from-rose-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-equi-main border-2 border-white shadow-sm group-hover:scale-105 transition">{user.name[0].toUpperCase()}</div>
                    <span className="text-sm font-bold text-gray-600 hidden md:block group-hover:text-equi-main transition">{user.name.split(' ')[0]}</span>
                    <span className="text-gray-300 text-xs hidden md:block">▼</span>
                </div>
            </div>
        </div>
      </nav>

      {showProfile && (
        <div className="fixed inset-0 z-[70] flex items-start justify-end p-4 pt-20" onClick={() => setShowProfile(false)}>
            <div className="bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 w-72 animate-in slide-in-from-top-4 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full flex items-center justify-center text-3xl mb-4 text-equi-main border-4 border-white shadow-md">{user.name[0].toUpperCase()}</div>
                    <h3 className="font-bold text-lg text-gray-800">{user.name}</h3>
                    <p className="text-xs text-gray-400 mb-6">{user.email}</p>
                    <div className="w-full border-t border-gray-50 mb-4"></div>
                    <button onClick={() => { setShowProfile(false); setUser(null); }} className="w-full py-3 rounded-xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition flex items-center justify-center gap-2">Sign Out</button>
                </div>
            </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative">
                <button onClick={()=>setShowForm(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition">✕</button>
                <h3 className="font-bold text-xl mb-6 text-gray-800">New Subscription</h3>
                <form onSubmit={handleAddSub} className="space-y-4">
                    <input className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-equi-main/20" placeholder="Name (e.g. Spotify)" value={newSub.name} onChange={e=>setNewSub({...newSub, name:e.target.value})} required/>
                    <input className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-equi-main/20" type="number" placeholder="Price" value={newSub.price} onChange={e=>setNewSub({...newSub, price:e.target.value})} required/>
                    <select className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-equi-main/20 appearance-none" value={newSub.type} onChange={e=>setNewSub({...newSub, type:e.target.value})}>
                        <option value="Personal">Personal</option><option value="Entertainment">Entertainment</option><option value="Work">Work / Tools</option><option value="Utilities">Utilities</option><option value="Family">Family</option>
                    </select>
                    <input className="w-full p-3 bg-gray-50 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-equi-main/20" type="date" value={newSub.date} onChange={e=>setNewSub({...newSub, date:e.target.value})} required/>
                    <button type="submit" className="w-full bg-equi-main text-white py-4 rounded-xl font-bold shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-[1.02] transition mt-2">Save Record</button>
                </form>
            </div>
        </div>
      )}

      <main className="pt-28 px-6 max-w-6xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-[#FF8FAB] to-[#E56D8D] text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <p className="text-white/80 text-sm font-bold tracking-widest uppercase mb-2">Total Monthly Bills</p>
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight">Rp {total.toLocaleString('id-ID')}</h2>
                    <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Active Subscriptions</span>
                    </div>
                </div>
                <div className="text-right hidden md:block"><p className="text-2xl mb-1">🌸</p><p className="font-mono text-white/80 tracking-widest">**** 8829</p></div>
            </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex justify-between items-end px-2">
                <h3 className="font-bold text-xl text-gray-800">Your Subscriptions</h3>
                <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">{subs.length} Active</span>
            </div>
            <div className="space-y-3">
                {subs.map((sub, i) => {
                    const isSplit = sub.shared_with && sub.shared_with.length > 0;
                    const isPaidThisMonth = sub.paid_months && sub.paid_months.includes(currentMonthStr);

                    return (
                        <div key={i} onClick={()=>selectForSplit(sub)} 
                             className={`bg-white p-5 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] border transition-all duration-300 flex justify-between items-center group
                             ${isSplit ? 'border-equi-main/30 bg-rose-50/20' : 'border-white hover:border-rose-100'}`}>
                            <div className="flex gap-4 items-center">
                                <SubscriptionLogo name={sub.name} />
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg">{sub.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                        {isPaidThisMonth ? (
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase border border-green-100">Next: {nextMonthStr}</span>
                                        ) : (
                                            <button onClick={(e) => { e.stopPropagation(); handlePayMonth(sub.id, currentMonthStr); }} 
                                                className="text-[10px] font-bold text-white bg-rose-400 px-3 py-1 rounded-full shadow-md hover:bg-rose-500 transition">
                                                Pay Now
                                            </button>
                                        )}
                                        {isSplit && <span className="text-[10px] font-bold text-white bg-equi-main px-2 py-0.5 rounded-md">SPLIT</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-5 items-center">
                                <div className="text-right">
                                    <span className={`font-bold block ${isPaidThisMonth ? 'text-green-500' : 'text-gray-700'}`}>Rp {parseInt(sub.cost_for_me || sub.price).toLocaleString('id-ID')}</span>
                                    {isSplit && <span className="text-[10px] text-gray-400 line-through">Rp {parseInt(sub.price).toLocaleString('id-ID')}</span>}
                                </div>
                                <button onClick={(e)=>{e.stopPropagation(); handleDelSub(sub.id)}} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition">🗑️</button>
                            </div>
                        </div>
                    )
                })}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {['calendar', 'split', 'analytics'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 capitalize ${activeTab === tab ? 'bg-gradient-to-r from-equi-main to-rose-400 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}>
                        {tab === 'calendar' ? '📅' : tab === 'split' ? '⚡' : '📊'} {tab}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in slide-in-from-right duration-300 space-y-6 min-h-[400px]">
                {activeTab === 'calendar' && <CalendarWidget subs={subs} />}
                
                {activeTab === 'split' && (
                    <>
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50/50 relative overflow-hidden">
                        {editingSplitId && <div className="absolute top-0 left-0 w-full bg-yellow-100 text-yellow-700 text-xs font-bold text-center py-1">✏️ EDITING MODE</div>}
                        <div className="relative z-10 space-y-4 mt-2">
                            <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Activity / Sub</label><input className={`w-full p-3 rounded-xl text-sm font-bold text-gray-700 border border-transparent outline-none transition-all ${linkedSubId ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:border-equi-main'}`} placeholder="e.g. Lunch" value={splitTitle} onChange={e=>setSplitTitle(e.target.value)} disabled={!!linkedSubId} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Total Amount</label><input type="number" className={`w-full p-3 rounded-xl text-sm font-bold text-gray-700 border border-transparent outline-none transition-all ${linkedSubId ? 'bg-gray-100 cursor-not-allowed' : 'bg-gray-50 focus:bg-white focus:border-equi-main'}`} placeholder="Rp 0" value={splitTotal} onChange={e=>setSplitTotal(e.target.value)} disabled={!!linkedSubId} /></div>
                                <div className="space-y-1"><label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Friends (Comma)</label><input className="w-full p-3 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 focus:bg-white border border-transparent focus:border-equi-main outline-none transition-all" placeholder="Budi, Siti..." value={splitNames} onChange={e=>setSplitNames(e.target.value)} /></div>
                            </div>
                            <button onClick={handleSaveSplit} className="w-full bg-gradient-to-r from-equi-main to-rose-400 text-white py-4 rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg text-sm flex items-center justify-center gap-2"><span>💾</span> {editingSplitId ? 'Update Record' : 'Save Record'}</button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center px-1"><h3 className="font-bold text-gray-700 text-sm">Debt History</h3><span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{splits.length} records</span></div>
                        {splits.map((split) => (
                            <div key={split.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-rose-200 transition group relative">
                                <button onClick={()=>handleDeleteSplit(split.id)} className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-[10px]">✕</button>
                                {/* TOMBOL PENSIL (EDIT) */}
                                <button onClick={()=>handleEditSplit(split)} className="absolute top-2 right-10 w-6 h-6 flex items-center justify-center bg-blue-50 rounded-full text-blue-400 hover:bg-blue-500 hover:text-white opacity-0 group-hover:opacity-100 transition text-[10px] shadow-sm">✎</button>
                                <button onClick={()=>shareViaWA(split)} className="absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-green-50 text-green-500 hover:bg-green-500 hover:text-white transition shadow-sm" title="Share via WhatsApp">📱</button>
                                <div className="flex justify-between items-center mb-3 pr-16"><div className="pr-2"><h4 className="font-bold text-gray-700 text-sm truncate">{split.title}</h4><p className="text-[10px] text-gray-400">{split.date}</p></div><span className="font-bold text-xs text-rose-500 bg-rose-50 px-2 py-1 rounded-lg whitespace-nowrap">Rp {parseInt(split.total_amount).toLocaleString()}</span></div>
                                <div className="space-y-2 bg-gray-50/50 p-2 rounded-xl">
                                    {split.members.map((m, idx) => (
                                        <div key={idx} onClick={()=>handleTogglePaid(split.id, idx)} className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition ${m.is_paid ? 'bg-white opacity-50' : 'hover:bg-white hover:shadow-sm'}`}>
                                            <div className="flex items-center gap-2"><div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${m.is_paid ? 'bg-green-500 border-green-500 scale-110' : 'border-gray-300 bg-white'}`}>{m.is_paid && <span className="text-white text-[8px] font-bold">✓</span>}</div><span className={`text-xs font-medium ${m.is_paid ? 'text-gray-400 line-through' : 'text-gray-600'}`}>{m.name}</span></div><span className={`text-[10px] font-bold ${m.is_paid ? 'text-green-500' : 'text-gray-500'}`}>{parseInt(m.amount).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    </>
                )}

                {activeTab === 'analytics' && (
                    <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-rose-50/50 flex flex-col items-center justify-center text-center min-h-[400px]">
                        <h3 className="font-bold text-gray-700 mb-2">Real Spending</h3>
                        <p className="text-xs text-gray-400 mb-6">Based on your share only</p>
                        <div className="w-full max-w-[280px] relative">
                            <Doughnut data={chartConfig.data} options={chartConfig.options} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total</span>
                                <span className="text-lg font-bold text-equi-main">Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}