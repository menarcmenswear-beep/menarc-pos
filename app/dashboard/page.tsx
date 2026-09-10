'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  async function fetchSales() {
    setLoading(true);
    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setStatusMsg('Error fetching sales: ' + error.message);
    } else if (data) {
      setSales(data);
    }
    setLoading(false);
  }

  // Calculate metrics
  const totalRevenue = sales.reduce((acc, item) => acc + (item.final_value || 0), 0);
  const totalUnits = sales.reduce((acc, item) => acc + (item.qty || 0), 0);
  const totalTransactions = sales.length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-widest">MENARC</h1>
            <p className="text-xs text-neutral-400">Sales Analytics & Revenue Dashboard</p>
          </div>
          <nav className="flex items-center gap-2">
            <Link 
              href="/" 
              className="text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded transition"
            >
              POS Checkout
            </Link>
            <Link 
              href="/inventory" 
              className="text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded transition"
            >
              Inventory
            </Link>
            <Link 
              href="/dashboard" 
              className="text-xs text-white bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded transition"
            >
              Dashboard
            </Link>
          </nav>
        </header>

        {statusMsg && (
          <div className="mb-6 p-3 bg-neutral-900 border border-neutral-700 text-yellow-400 text-sm rounded">
            {statusMsg}
          </div>
        )}

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-3xl font-black font-mono text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Units Sold</p>
            <p className="text-3xl font-black font-mono text-white">{totalUnits}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
            <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total Transactions</p>
            <p className="text-3xl font-black font-mono text-white">{totalTransactions}</p>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-base text-neutral-200">Recent Sales History</h2>
            <button 
              onClick={fetchSales} 
              className="text-xs text-neutral-400 hover:text-white border border-neutral-800 px-2.5 py-1 rounded transition"
            >
              Refresh Data
            </button>
          </div>

          {loading ? (
            <p className="text-sm text-neutral-500 py-4">Loading analytics...</p>
          ) : sales.length === 0 ? (
            <p className="text-sm text-neutral-500 py-4">No sales recorded yet.</p>
          ) : (
            <div className="divide-y divide-neutral-800 max-h-[420px] overflow-y-auto pr-2">
              {sales.map((sale) => (
                <div key={sale.id} className="py-3.5 flex justify-between items-center text-sm">
                  <div>
                    <p className="font-semibold text-neutral-100 uppercase">{sale.sku}</p>
                    <p className="text-xs text-neutral-400">
                      Qty: {sale.qty} • Rate: ₹{sale.item_rate} {sale.discount > 0 ? `• Discount: ₹${sale.discount}` : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-white">₹{sale.final_value}</p>
                    <p className="text-xs text-neutral-500">
                      {sale.created_at ? new Date(sale.created_at).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
