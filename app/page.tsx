'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function POS() {
  const [sku, setSku] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('*');
    if (data) setInventory(data);
  }

  function addToCart() {
    const item = inventory.find(i => i.sku === sku.toUpperCase());
    if (item) {
      setCart([...cart, { ...item, checkoutQty: 1, discount: 0 }]);
      setSku('');
    } else {
      alert('SKU not found in master stock');
    }
  }

  async function completeSale() {
    for (const item of cart) {
      const finalValue = (item.checkoutQty * item.price) - item.discount;
      await supabase.from('sales').insert({
        sku: item.sku,
        qty: item.checkoutQty,
        item_rate: item.price,
        discount: item.discount,
        final_value: finalValue
      });
    }
    alert('MENARC Sale Completed.');
    setCart([]);
    fetchInventory(); 
  }

  return (
    <div className="p-8 max-w-4xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-8 tracking-tight">MENARC Offline POS</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="font-bold mb-4">Live Inventory</h2>
          {inventory.map(item => (
            <div key={item.sku} className="flex justify-between border-b py-2 text-sm">
              <span>{item.sku}</span>
              <span className={item.current_quantity < 15 ? 'text-red-500 font-bold' : ''}>
                Stock: {item.current_quantity}
              </span>
            </div>
          ))}
        </div>

        <div>
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="Scan or type SKU..." 
              className="border p-2 w-full uppercase"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addToCart()}
            />
            <button onClick={addToCart} className="bg-black text-white px-4">Add</button>
          </div>

          <div className="bg-white border p-6 min-h-[300px] flex flex-col justify-between">
            <div>
              <h2 className="font-bold mb-4">Current Cart</h2>
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1">
                  <span>{item.sku} (x{item.checkoutQty})</span>
                  <span>${item.price}</span>
                </div>
              ))}
            </div>
            
            {cart.length > 0 && (
              <button 
                onClick={completeSale} 
                className="w-full bg-black text-white py-3 font-bold mt-4"
              >
                COMPLETE SALE
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
