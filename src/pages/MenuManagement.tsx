import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  EyeOff, 
  Eye,
  Camera,
  X,
  Upload,
  Loader2
} from 'lucide-react';
import { restaurantService, resolveImageUrl } from '../lib/api';
import { MenuItem } from '../types';
import { formatCurrency, cn } from '../lib/utils';

const CATEGORIES = ['All Items', 'Main Course', 'Drinks', 'Desserts', 'Appetizers'];

export default function MenuManagement() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Items');
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    availability: 'available',
    imageUrl: '',
    stockLevel: '100'
  });

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          const res = await restaurantService.getProfile(user.email);
          setRestaurantId(res.data.id);
          const menuRes = await restaurantService.getMenu(res.data.id);
          setItems(menuRes.data);
        } catch (err) {
          console.error("Failed to fetch profile or menu", err);
        }
      }
    };
    fetchRestaurantAndMenu();
  }, []);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const url = await restaurantService.uploadImage(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;

    const data = {
      ...formData,
      restaurantId: restaurantId,
      price: parseFloat(formData.price),
      stockLevel: parseInt(formData.stockLevel)
    };

    try {
      if (editingItem) {
        const res = await restaurantService.updateMenuItem(editingItem.id, { ...data, id: editingItem.id });
        setItems(items.map(i => i.id === editingItem.id ? res.data : i));
      } else {
        const res = await restaurantService.addMenuItem(data);
        setItems([...items, res.data]);
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save menu item", err);
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    const nextValue = item.availability === 'available' ? 'out_of_stock' : 'available';
    try {
      const res = await restaurantService.updateMenuItem(item.id, { ...item, availability: nextValue });
      setItems(items.map(i => i.id === item.id ? res.data : i));
    } catch (err) {
      console.error("Failed to toggle availability", err);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await restaurantService.deleteMenuItem(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err) {
      console.error("Failed to delete menu item", err);
    }
  };

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        category: item.category,
        availability: item.availability,
        imageUrl: item.imageUrl,
        stockLevel: item.stockLevel.toString()
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: activeCategory !== 'All Items' ? activeCategory : 'Main Course',
        availability: 'available',
        imageUrl: '',
        stockLevel: '100'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All Items' || i.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search menu items..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary text-white px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest flex items-center gap-2 hover:bg-primary-hover transition-all shadow-sm shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          Add New Item
        </button>
      </div>

      {/* Category Tabs — fully interactive */}
      <div className="flex gap-6 border-b border-border overflow-x-auto scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "pb-3 px-1 text-[11px] font-extrabold uppercase tracking-widest relative transition-colors whitespace-nowrap",
              activeCategory === cat ? "text-primary" : "text-text-muted hover:text-text-main"
            )}
          >
            {cat}
            {activeCategory === cat && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Count label */}
      <p className="text-xs text-text-muted font-medium">
        {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} in{' '}
        <span className="text-primary font-bold">{activeCategory}</span>
      </p>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
            <Camera className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-text-muted">No items in this category yet.</p>
            <button
              onClick={() => openModal()}
              className="mt-4 text-xs font-bold text-primary underline underline-offset-2"
            >
              + Add first item
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="card group hover:border-primary transition-all">
              <div className="relative h-44 overflow-hidden">
                {item.imageUrl ? (
                  <img src={resolveImageUrl(item.imageUrl)} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-slate-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button 
                    onClick={() => toggleAvailability(item)}
                    className={cn(
                      "p-2 rounded-lg backdrop-blur-md transition-all shadow-sm",
                      item.availability === 'available' ? "bg-white/90 text-emerald-600 hover:bg-emerald-50" : "bg-slate-900/90 text-white hover:bg-slate-800"
                    )}
                  >
                    {item.availability === 'available' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <div className="relative group/menu">
                    <button className="p-2 bg-white/90 backdrop-blur-md rounded-lg text-slate-900 shadow-sm hover:bg-white transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-border hidden group-hover/menu:block z-20 overflow-hidden">
                      <button onClick={() => openModal(item)} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 flex items-center gap-2 text-text-main">
                        <Edit2 className="w-3.5 h-3.5 text-primary" /> Edit
                      </button>
                      <button onClick={() => deleteItem(item.id)} className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-red-50 text-red-500 flex items-center gap-2">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-black rounded-[4px] uppercase tracking-widest shadow-sm">
                    {item.category}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className="text-lg font-extrabold text-text-main leading-tight">{item.name}</h4>
                  <p className="text-lg font-black text-primary leading-tight">{formatCurrency(item.price)}</p>
                </div>
                <p className="text-text-muted text-xs font-medium line-clamp-2 flex-1 mb-4 leading-relaxed">{item.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", item.availability === 'available' ? "bg-emerald-500" : "bg-red-500")} />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{item.availability.replace('_', ' ')}</span>
                  </div>
                  <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-60">Stock: {item.stockLevel}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-[#2563eb] sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button onClick={closeModal} className="text-white/80 hover:text-white p-2">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Item Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Classic Wagyu Burger"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Price (ETB)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="120.00"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2563eb]"
                  >
                    <option>Main Course</option>
                    <option>Drinks</option>
                    <option>Desserts</option>
                    <option>Appetizers</option>
                  </select>
                </div>

                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="Tell your customers about this dish..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2563eb] resize-none"
                  />
                </div>

                {/* Image Upload */}
                <div className="col-span-2 space-y-3">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Item Photo</label>
                  <div className="flex gap-4 items-start">
                    {/* Preview */}
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                      {formData.imageUrl ? (
                        <img src={resolveImageUrl(formData.imageUrl)} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:border-[#2563eb] hover:bg-blue-50 transition-all text-sm font-bold text-slate-600 hover:text-[#2563eb] disabled:opacity-60"
                      >
                        {uploadingImage ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> Choose from Device</>
                        )}
                      </button>
                      <p className="text-[11px] text-slate-400 text-center">JPG, PNG, WEBP · Max 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Stock Level</label>
                  <input 
                    type="number"
                    value={formData.stockLevel}
                    onChange={(e) => setFormData({...formData, stockLevel: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2563eb]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Availability</label>
                  <select 
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#2563eb]"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={uploadingImage}
                  className="flex-1 bg-[#2563eb] text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-60"
                >
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
