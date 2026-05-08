import React, { useState, useEffect } from 'react';
import { Store, Mail, Phone, MapPin, Info, Camera, Save, Globe } from 'lucide-react';
import { restaurantService } from '../lib/api';
import { cn } from '../lib/utils';

export default function RestaurantProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restaurant, setRestaurant] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    description: '',
    category: 'General',
    imageUrl: '',
    latitude: 9.03,
    longitude: 38.74,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          const res = await restaurantService.getProfile(user.email);
          setRestaurant(res.data);
          setFormData({
            name: res.data.name || '',
            email: res.data.email || user.email,
            phoneNumber: res.data.phoneNumber || '',
            address: res.data.address || '',
            description: res.data.description || '',
            category: res.data.category || 'General',
            imageUrl: res.data.imageUrl || '',
            latitude: res.data.latitude || 9.03,
            longitude: res.data.longitude || 38.74,
          });
        } catch (err: any) {
          if (err.response?.status === 404) {
            // Profile doesn't exist, use default data from user
            setFormData(prev => ({ ...prev, email: user.email }));
          } else {
            setError('Failed to load profile');
          }
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (restaurant) {
        await restaurantService.updateProfile(restaurant.id, { ...formData, id: restaurant.id });
        setSuccess('Profile updated successfully!');
      } else {
        const res = await restaurantService.registerProfile(formData);
        setRestaurant(res.data);
        setSuccess('Restaurant registered successfully!');
      }
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Restaurant Profile</h1>
          <p className="text-slate-500">Manage your restaurant's public information</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Info */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Store className="w-5 h-5 text-primary" /> Basic Details
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Restaurant Name</label>
              <input 
                required
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Gourmet Kitchen"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
              >
                <option>General</option>
                <option>Traditional</option>
                <option>Fast Food</option>
                <option>Cafe</option>
                <option>Fine Dining</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell users what makes your restaurant special..."
              />
            </div>
          </div>

          {/* Contact & Location */}
          <div className="card p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Phone className="w-5 h-5 text-primary" /> Contact & Location
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email (Read-only)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  disabled
                  value={formData.email}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-border rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  value={formData.phoneNumber}
                  onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+251 ..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Physical Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  required
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Street, City"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Latitude</label>
                <input 
                  type="number" step="any"
                  value={formData.latitude}
                  onChange={e => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Longitude</label>
                <input 
                  type="number" step="any"
                  value={formData.longitude}
                  onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="card p-6 md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
              <Camera className="w-5 h-5 text-primary" /> Visuals
            </h3>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/3 aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-dashed border-slate-300 flex items-center justify-center">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <Camera className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Banner Image URL</label>
                  <input 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <p className="text-xs text-slate-500">Use a high-quality landscape image for your restaurant banner.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-blue-100 disabled:opacity-70"
          >
            {saving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {restaurant ? 'Update Profile' : 'Register Restaurant'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
