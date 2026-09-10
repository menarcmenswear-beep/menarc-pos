'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function InventoryManagement() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Form state for new product
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newSize, setNewSize] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').order('sku');
    if (error) {
      setStatusMsg('Error fetching stock: ' + error.message);
    } else if (data) {
      setInventory(data);
    }
    setLoading(false);
  }

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newSku || !newPrice || !newQty) {
      alert('Please fill out SKU, Price, and Quantity.');
      return;
    }

    const { error } = await supabase.from('inventory').insert({
      sku: newSku.trim().toUpperCase(),
      name: newName.trim(),
      color: newColor.trim(),
      size: newSize.trim(),
      price: parseFloat(newPrice),
      current_quantity: parseInt(newQty)
    });

    if (error) {
      alert('Error adding product: ' + error.message);
    } else {
      alert('Product added successfully!');
      setNewSku('');
      setNewName('');
      setNewColor('');
      setNewSize('');
      setNewPrice('');
      setNewQty('');
      fetchInventory();
    }
  }

  async function updateQuantity(sku: string, currentQty: number, delta: number) {
    const updatedQty = Math.max(0, currentQty + delta);
    const { error } = await supabase
      .from('inventory')
      .update({ current_quantity: updatedQty })
      .eq('sku', sku);

    if (error) {
      alert('Failed to update quantity: ' + error.message);
    } else {
      fetchInventory();
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-widest">MENARC</h1>
            <p className="text-xs text-neutral-400">Inventory Management & Stock Control</p>
          </div>
          <Link 
            href="/" 
            className="text-xs text-neutral-400 hover:text-white border border-neutral-800 px-3 py-1.5 rounded transition"
          >
            Back to POS
          </Link>
        </header>

        {statusMsg && (
          <div className="mb-6 p-3 bg-neutral-900 border border-neutral-700 text-yellow-400 text-sm rounded">
            {statusMsg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg h-fit">
            <h2 className="font-bold text-base text-neutral-200 mb-4">Add New Item</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">SKU *</label>
                <input
                  type="text"
                  placeholder="TSH-WHT-L"
                  className="bg-neutral-950 border border-neutral-700 rounded p-2 text-sm uppercase text-white focus:outline-none focus:border-white w-full"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="Regular Fit T-Shirt"
                  className="bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white w-full"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Color</label>
                  <input
                    type="text"
                    placeholder="White"
                    className="bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white w-full"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Size</label>
                  <input
                    type="text"
                    placeholder="L"
                    className="bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white w-full"
                    value={newSize}
                    onChange={(e) => setNewSize(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="499"
                    className="bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white w-full"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    placeholder="50"
                    className="bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white w-full"
                    value={newQty}
                    onChange={(e) => setNewQty(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-2.5 rounded hover:bg-neutral-200 transition text-sm mt-2"
              >
                Save Product
              </button>
            </form>
          </div>

          {/* Inventory Table List */}
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base text-neutral-200">Catalog Stock List</h2>
              <span className="text-xs text-neutral-500">{inventory.length} Total SKUs</span>
            </div>

            {loading ? (
              <p className="text-sm text-neutral-500 py-4">Loading catalog...</p>
            ) : inventory.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4">No inventory items found.</p>
            ) : (
              <div className="divide-y divide-neutral-800 max-h-[500px] overflow-y-auto pr-2">
                {inventory.map((item) => (
                  <div key={item.sku} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-semibold text-neutral-100">{item.sku}</p>
                      <p className="text-xs text-neutral-400">
                        {item.name || 'Unnamed'} {item.color ? `• ${item.color}` : ''} {item.size ? `• ${item.size}` : ''} | ₹{item.price}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-neutral-300">{item.current_quantity} qty</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => updateQuantity(item.sku, item.current_quantity, -1)}
                          className="bg-neutral-800 px-2 py-1 rounded text-xs hover:bg-neutral-700"
                        >
                          -
                        </button>
                        <button 
                          onClick={() => updateQuantity(item.sku, item.current_quantity, 1)}
                          className="bg-neutral-800 px-2 py-1 rounded text-xs hover:bg-neutral-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
