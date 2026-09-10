'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function POS() {
  const [sku, setSku] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*');
    if (error) {
      console.error('Fetch error:', error);
      setStatusMsg('Error fetching stock: ' + error.message);
    } else if (data) {
      setInventory(data);
    }
    setLoading(false);
  }

  function addToCart() {
    const cleanSku = sku.trim().toUpperCase();
    const item = inventory.find(i => i.sku.toUpperCase() === cleanSku);
    if (item) {
      if (item.current_quantity <= 0) {
        alert('Item out of stock!');
        return;
      }
      setCart([...cart, { ...item, checkoutQty: 1, discount: 0 }]);
      setSku('');
      setStatusMsg('');
    } else {
      alert(`SKU "${cleanSku}" not found in inventory.`);
    }
  }

  async function completeSale() {
    if (cart.length === 0) return;
    setStatusMsg('Processing checkout...');

    for (const item of cart) {
      const finalValue = (item.checkoutQty * item.price) - item.discount;
      const { error } = await supabase.from('sales').insert({
        sku: item.sku,
        qty: item.checkoutQty,
        item_rate: item.price,
        discount: item.discount,
        final_value: finalValue
      });

      if (error) {
        alert('Sale failed: ' + error.message);
        setStatusMsg('');
        return;
      }
    }

    alert('MENARC Sale Completed Successfully.');
    setCart([]);
    setStatusMsg('');
    fetchInventory();
  }

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.checkoutQty) - item.discount, 0);

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-widest">MENARC</h1>
            <p className="text-xs text-neutral-400">Offline Point of Sale & Inventory</p>
          </div>
          <nav className="flex items-center gap-2">
            <Link 
              href="/" 
              className="text-xs text-white bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded transition"
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
              className="text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded transition"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Live Inventory Column */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base text-neutral-200">Live Inventory</h2>
              <button 
                onClick={fetchInventory} 
                className="text-xs text-neutral-400 hover:text-white border border-neutral-800 px-2.5 py-1 rounded transition"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-neutral-500 py-4">Loading inventory...</p>
            ) : inventory.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4">No products found in database.</p>
            ) : (
              <div className="divide-y divide-neutral-800 max-h-[420px] overflow-y-auto pr-2">
                {inventory.map((item) => (
                  <div key={item.sku} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-neutral-100">{item.sku}</p>
                      <p className="text-xs text-neutral-400">{item.name} {item.color ? `• ${item.color}` : ''} {item.size ? `• ${item.size}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono text-sm ${item.current_quantity < 15 ? 'text-amber-400 font-bold' : 'text-neutral-300'}`}>
                        {item.current_quantity} in stock
                      </p>
                      <p className="text-xs text-neutral-500">₹{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout / Cart Column */}
          <div className="space-y-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Scan or type SKU (e.g. TSH-BLK-M)..."
                className="bg-neutral-900 border border-neutral-700 text-white px-4 py-3 rounded-lg w-full uppercase placeholder:text-neutral-500 focus:outline-none focus:border-white text-sm tracking-wider"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToCart()}
              />
              <button
                onClick={addToCart}
                className="bg-white text-black font-bold px-6 py-3 rounded-lg hover:bg-neutral-200 transition text-sm shrink-0"
              >
                Add
              </button>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col justify-between min-h-[340px] shadow-lg">
              <div>
                <h2 className="font-bold text-base text-neutral-200 mb-4">Current Cart</h2>
                {cart.length === 0 ? (
                  <p className="text-sm text-neutral-500 py-12 text-center">Cart is empty. Enter a SKU above to begin sale.</p>
                ) : (
                  <div className="divide-y divide-neutral-800 max-h-[220px] overflow-y-auto pr-2">
                    {cart.map((item, index) => (
                      <div key={index} className="py-2.5 flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium text-white">{item.sku}</p>
                          <p className="text-xs text-neutral-400">Qty: {item.checkoutQty}</p>
                        </div>
                        <span className="font-mono text-neutral-200">₹{item.price * item.checkoutQty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <div className="pt-4 border-t border-neutral-800 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold mb-4">
                    <span>Total</span>
                    <span className="font-mono text-white">₹{cartTotal}</span>
                  </div>
                  <button
                    onClick={completeSale}
                    className="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-neutral-200 transition tracking-wide text-sm"
                  >
                    COMPLETE SALE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
