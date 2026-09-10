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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Form state for new product
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('T-Shirts');
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
      category: newCategory.trim(),
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

  // Extract unique categories for filter dropdown
  const categories = ['ALL', ...Array.from(new Set(inventory.map(item => item.category || 'General')))];

  // Filter inventory based on search term and category
  const filteredInventory = inventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      item.sku?.toLowerCase().includes(term) ||
      item.name?.toLowerCase().includes(term) ||
      item.color?.toLowerCase().includes(term) ||
      item.size?.toLowerCase().includes(term);

    const matchesCategory = selectedCategory === 'ALL' || (item.category || 'General') === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-black tracking-widest">MENARC</h1>
            <p className="text-xs text-neutral-400">Inventory Management & Stock Control</p>
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
              className="text-xs text-white bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded transition"
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
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="T-Shirts / Activewear"
                  className="bg-neutral-950 border border-neutral-700 rounded p-2 text-sm text-white focus:outline-none focus:border-white w-full"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
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

          {/* Inventory Table List with Category Filter */}
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div>
                <h2 className="font-bold text-base text-neutral-200">Catalog Stock List</h2>
                <p className="text-xs text-neutral-500">Showing {filteredInventory.length} of {inventory.length} SKUs</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  className="bg-neutral-950 border border-neutral-700 text-white px-3 py-1.5 rounded text-xs focus:outline-none focus:border-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search SKU, name..."
                  className="bg-neutral-950 border border-neutral-700 text-white px-3 py-1.5 rounded text-xs focus:outline-none focus:border-white w-full sm:w-44"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <p className="text-sm text-neutral-500 py-4">Loading catalog...</p>
            ) : filteredInventory.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4">No matching inventory items found.</p>
            ) : (
              <div className="divide-y divide-neutral-800 max-h-[440px] overflow-y-auto pr-2">
                {filteredInventory.map((item) => {
                  const isLowStock = item.current_quantity < 15;
                  return (
                    <div key={item.sku} className="py-3 flex justify-between items-center text-sm">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-neutral-100">{item.sku}</p>
                          <span className="bg-neutral-800 text-neutral-300 text-[10px] px-1.5 py-0.5 rounded">
                            {item.category || 'General'}
                          </span>
                          {isLowStock && (
                            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0.5 rounded font-medium">
                              Low Stock
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400">
                          {item.name || 'Unnamed'} {item.color ? `• ${item.color}` : ''} {item.size ? `• ${item.size}` : ''} | ₹{item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-sm ${isLowStock ? 'text-amber-400 font-bold' : 'text-neutral-300'}`}>
                          {item.current_quantity} qty
                        </span>
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
