import React, { useState } from 'react';
import { User, Package, MapPin, ChevronRight, X, LogOut, CreditCard, Bell } from 'lucide-react';
import { Order, CustomerAddress } from '../types';

interface CustomerPanelProps {
  onClose: () => void;
  themeColor: string;
}

export const CustomerPanel: React.FC<CustomerPanelProps> = ({ onClose, themeColor }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile');

  const customer = {
    name: "Anjali Sharma",
    phone: "+91 98765 43210",
    email: "anjali.s@example.com",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200"
  };

  const orders: Order[] = [
    { id: "ORD-2024-001", date: "Oct 12, 2024", status: "Delivered", total: "₹45,000", items: ["Gold Necklace", "Stud Earrings"] },
    { id: "ORD-2024-023", date: "Nov 05, 2024", status: "Processing", total: "₹12,500", items: ["Silver Anklet"] }
  ];

  const addresses: CustomerAddress[] = [
    { id: "1", type: "Home", text: "12/A, Lotus Apartments, Bandra West, Mumbai - 400050" },
    { id: "2", type: "Work", text: "Tech Park, Sector 5, Bengaluru - 560001" }
  ];

  return (
    <div className="absolute inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full h-[95%] md:h-[90%] bg-zinc-50 rounded-t-3xl md:rounded-3xl overflow-hidden flex flex-col animate-fade-in shadow-2xl">
        
        {/* Header */}
        <div className="p-8 pb-12 bg-black text-white relative shrink-0">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors text-white">
            <X size={20} />
          </button>
          <div className="flex items-center gap-5 mt-2">
            <img src={customer.image} alt="Profile" className="h-16 w-16 rounded-full border-2 border-white object-cover" />
            <div>
              <h2 className="text-xl font-bold font-serif">{customer.name}</h2>
              <p className="text-zinc-400 text-sm">{customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Floating Navigation Tabs */}
        <div className="px-6 -mt-8 mb-4 relative z-10">
          <div className="flex bg-white rounded-xl shadow-lg border border-zinc-100 p-1">
            {[
              { id: 'profile', icon: User, label: 'Profile' },
              { id: 'orders', icon: Package, label: 'Orders' },
              { id: 'addresses', icon: MapPin, label: 'Addresses' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-md' : 'text-zinc-400 hover:text-zinc-600'}`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          
          {activeTab === 'profile' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
                   <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Contact Info</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-50 pb-3 last:border-0 last:pb-0">
                         <span className="text-zinc-500 text-sm font-medium">Email</span>
                         <span className="font-bold text-zinc-900 text-sm">{customer.email}</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-zinc-500 text-sm font-medium">Mobile</span>
                         <span className="font-bold text-zinc-900 text-sm">{customer.phone}</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-zinc-200 shadow-sm">
                   <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-md transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-zinc-100 rounded-md text-zinc-500"><Bell size={16} /></div>
                         <span className="text-sm font-bold text-zinc-700">Notifications</span>
                      </div>
                      <ChevronRight size={16} className="text-zinc-300" />
                   </button>
                   <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 rounded-md transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-zinc-100 rounded-md text-zinc-500"><CreditCard size={16} /></div>
                         <span className="text-sm font-bold text-zinc-700">Payment Methods</span>
                      </div>
                      <ChevronRight size={16} className="text-zinc-300" />
                   </button>
                </div>

                <button className="w-full py-4 text-red-600 font-bold text-sm bg-white border border-red-100 rounded-lg hover:bg-red-50 flex items-center justify-center gap-2 transition-colors">
                   <LogOut size={16} /> Sign Out
                </button>
             </div>
          )}

          {activeTab === 'orders' && (
             <div className="space-y-4 animate-fade-in">
                {orders.map(order => (
                   <div key={order.id} className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-3">
                         <span className="font-bold text-xs text-zinc-400 uppercase tracking-wide">#{order.id}</span>
                         <span className={`px-2 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wide ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-600'}`}>
                            {order.status}
                         </span>
                      </div>
                      <div className="text-base text-zinc-900 font-bold mb-1">{order.items.join(", ")}</div>
                      <p className="text-xs text-zinc-400 mb-4">{order.date}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-zinc-50">
                         <span className="text-xs font-bold text-zinc-500">Total Amount</span>
                         <span className="text-sm font-bold text-zinc-900">{order.total}</span>
                      </div>
                   </div>
                ))}
             </div>
          )}

          {activeTab === 'addresses' && (
             <div className="space-y-4 animate-fade-in">
                {addresses.map(addr => (
                   <div key={addr.id} className="bg-white border border-zinc-200 rounded-lg p-5 flex gap-4 shadow-sm items-start">
                      <div className="p-2 bg-zinc-100 rounded-md text-zinc-900 shrink-0">
                        <MapPin size={18} />
                      </div>
                      <div className="flex-1">
                         <span className="font-bold text-xs uppercase text-zinc-400 block mb-1 tracking-wider">{addr.type}</span>
                         <p className="text-sm text-zinc-800 leading-relaxed font-medium mb-3">{addr.text}</p>
                         <div className="flex gap-4">
                            <button className="text-xs font-bold text-zinc-400 hover:text-black transition-colors">Edit</button>
                            <button className="text-xs font-bold text-zinc-400 hover:text-red-600 transition-colors">Remove</button>
                         </div>
                      </div>
                   </div>
                ))}
                <button 
                  className="w-full py-4 border border-dashed border-zinc-300 rounded-lg text-zinc-400 font-bold text-sm hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
                  style={{ color: themeColor, borderColor: themeColor }}
                >
                   <MapPin size={16} /> Add New Address
                </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};