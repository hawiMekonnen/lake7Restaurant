import React, { useState, useEffect, useRef } from 'react';
import { Store, Mail, Phone, MapPin, Camera, Save, Upload, Loader2, User } from 'lucide-react';
import { restaurantService, resolveImageUrl } from '../lib/api';
import { cn } from '../lib/utils';

export default function RestaurantProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [restaurant, setRestaurant] = useState<any>(null);

  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    description: '',
    category: 'General',
    imageUrl: '',   // banner
    logoUrl: '',    // profile / logo
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
            logoUrl: res.data.logoUrl || '',
            latitude: res.data.latitude || 9.03,
            longitude: res.data.longitude || 38.74,
          });
        } catch (err: any) {
          if (err.response?.status === 404) {
            const userObj = JSON.parse(userStr);
            setFormData(prev => ({ ...prev, email: userObj.email }));
          } else {
            setError('Failed to load profile');
          }
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleUpload = async (
    file: File,
    field: 'imageUrl' | 'logoUrl',
    setUploading: (v: boolean) => void
  ) => {
    try {
      setUploading(true);
      const url = await restaurantService.uploadImage(file);
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch {
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

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
    } catch {
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Restaurant Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your restaurant's public information</p>
      </div>

      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">{error}</div>}
      {success && <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl border border-emerald-100 text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Basic Details */}
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-border rounded-xl outline-none text-slate-500"
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

          {/* Visuals — full width */}
          <div className="card p-6 md:col-span-2 space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Visuals
            </h3>

            {/* Logo / Profile Picture */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Restaurant Logo / Profile Picture</p>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center shrink-0">
                  {formData.logoUrl ? (
                    <img src={resolveImageUrl(formData.logoUrl)} className="w-full h-full object-cover" alt="Logo" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-8 h-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={logoInputRef}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, 'logoUrl', setUploadingLogo);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-sm font-bold text-slate-600 hover:text-primary disabled:opacity-60"
                  >
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo from Device'}
                  </button>
                  <p className="text-xs text-slate-400 mt-1.5">This logo appears on the customer app restaurant cards.</p>
                </div>
              </div>
            </div>

            {/* Banner Image */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Banner / Cover Image</p>
              <div className="flex flex-col md:flex-row gap-5 items-start">
                <div className="w-full md:w-1/3 aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-dashed border-slate-300 flex items-center justify-center shrink-0">
                  {formData.imageUrl ? (
                    <img src={resolveImageUrl(formData.imageUrl)} className="w-full h-full object-cover" alt="Banner Preview" referrerPolicy="no-referrer" />
                  ) : (
                    <Camera className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-3 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={bannerInputRef}
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(f, 'imageUrl', setUploadingBanner);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={uploadingBanner}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary hover:bg-blue-50 transition-all text-sm font-bold text-slate-600 hover:text-primary disabled:opacity-60"
                  >
                    {uploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingBanner ? 'Uploading...' : 'Upload Banner from Device'}
                  </button>
                  <p className="text-xs text-slate-400">High-quality landscape image shown at top of your restaurant page. JPG, PNG, WEBP accepted.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving || uploadingBanner || uploadingLogo}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-hover transition-all shadow-xl shadow-blue-100 disabled:opacity-70"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {restaurant ? 'Update Profile' : 'Register Restaurant'}
          </button>
        </div>
      </form>
    </div>
  );
}
