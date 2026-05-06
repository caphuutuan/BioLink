/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Linkedin, 
  ExternalLink, 
  ShoppingBag, 
  Smartphone, 
  Share2, 
  Copy, 
  Check,
  Globe,
  Plus,
  Trash2,
  X,
  Link as LinkIcon,
  Edit2,
  Music2
} from 'lucide-react';

type IconType = 'affiliate' | 'web' | 'social' | 'facebook' | 'instagram' | 'youtube' | 'tiktok' | 'linkedin';
type ViewMode = 'user' | 'admin';

interface LinkItem {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon: IconType;
  type: 'button' | 'card';
}

interface ProfileInfo {
  avatar: string;
  name: string;
  description: string;
}

const ICON_MAP: Record<IconType, any> = {
  affiliate: ShoppingBag,
  web: Globe,
  social: Smartphone,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music2,
  linkedin: Linkedin
};

const INITIAL_LINKS: LinkItem[] = [
  {
    id: '1',
    title: 'Khóa học Marketing Online 2024',
    description: 'Bí quyết xây dựng thương hiệu cá nhân và bán hàng hiệu quả.',
    url: '#',
    icon: 'affiliate',
    type: 'card'
  },
  {
    id: '2',
    title: 'Ghé thăm Website của tôi',
    url: 'https://example.com',
    icon: 'web',
    type: 'button'
  }
];

const INITIAL_PROFILE: ProfileInfo = {
  avatar: 'https://picsum.photos/seed/bio/200/200',
  name: 'Hữu Tuấn AI',
  description: 'Quản lý link affiliate và mạng xã hội của bạn một cách chuyên nghiệp.'
};

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('user');
  const [profile, setProfile] = useState<ProfileInfo>(() => {
    const saved = localStorage.getItem('bioflow_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('bioflow_links');
    return saved ? JSON.parse(saved) : INITIAL_LINKS;
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<{id: string, message: string, type: 'success' | 'info' | 'error'}[]>([]);
  const isAdminView = viewMode === 'admin';
  const [profileForm, setProfileForm] = useState<ProfileInfo>(profile);
  
  // Form State
  const [newLink, setNewLink] = useState<Partial<LinkItem>>({
    title: '',
    description: '',
    url: '',
    type: 'card',
    icon: 'affiliate'
  });

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  useEffect(() => {
    localStorage.setItem('bioflow_links', JSON.stringify(links));
  }, [links]);

  useEffect(() => {
    localStorage.setItem('bioflow_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    if (!isAdminView) {
      resetForm();
      setPendingDeleteId(null);
      setIsProfileModalOpen(false);
    }
  }, [isAdminView]);

  useEffect(() => {
    setProfileForm(profile);
  }, [profile]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    showToast('Đã copy link chia sẻ!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddLink = (e: FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) return;

    if (editingId) {
      // Update existing
      setLinks(links.map(l => l.id === editingId ? {
        ...l,
        title: newLink.title!,
        description: newLink.description || '',
        url: newLink.url!,
        type: newLink.type as 'button' | 'card',
        icon: newLink.icon as IconType
      } : l));
      setEditingId(null);
      showToast('Đã cập nhật link thành công!');
    } else {
      // Add new
      const link: LinkItem = {
        id: Date.now().toString(),
        title: newLink.title!,
        description: newLink.description || '',
        url: newLink.url!,
        type: newLink.type as 'button' | 'card',
        icon: newLink.icon as IconType
      };
      setLinks([link, ...links]);
      showToast('Đã thêm link mới!');
    }

    setNewLink({ title: '', description: '', url: '', type: 'card', icon: 'affiliate' });
    setIsAdding(false);
  };

  const handleUpdateProfile = (e: FormEvent) => {
    e.preventDefault();

    const nextProfile: ProfileInfo = {
      avatar: profileForm.avatar.trim() || INITIAL_PROFILE.avatar,
      name: profileForm.name.trim() || INITIAL_PROFILE.name,
      description: profileForm.description.trim() || INITIAL_PROFILE.description
    };

    setProfile(nextProfile);
    showToast('Đã cập nhật thông tin hồ sơ!');
  };

  const startEdit = (link: LinkItem) => {
    setNewLink(link);
    setEditingId(link.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setNewLink({ title: '', description: '', url: '', type: 'card', icon: 'affiliate' });
    setEditingId(null);
    setIsAdding(false);
  };

  const deleteLink = (e: MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;

    setLinks(prev => prev.filter(l => l.id !== pendingDeleteId));
    if (editingId === pendingDeleteId) resetForm();
    setPendingDeleteId(null);
    showToast('Đã xóa link!', 'error');
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
  };

  const getIconComponent = (type: IconType) => {
    return ICON_MAP[type] || LinkIcon;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 relative">
      {isAdminView && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
          <button
            type="button"
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-full text-sm font-semibold hover:border-brand-accent hover:text-brand-accent transition-colors shadow-sm"
          >
            Sửa thông tin
          </button>
        </div>
      )}

      {/* Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-10 w-full max-w-md"
      >
        <div className="relative mb-6">
          <img 
            src={profile.avatar}
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
            referrerPolicy="no-referrer"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-600 hover:text-brand-accent transition-colors"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
          </motion.button>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h1>
        <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[280px]">
          {profile.description}
        </p>
      </motion.div>

      <div className="w-full max-w-md flex items-center justify-center mb-6">
        <div className="inline-flex p-1 bg-white rounded-full border border-gray-200 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode('user')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              !isAdminView ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('admin')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              isAdminView ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin View
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      {isAdminView && (
        <div className="w-full max-w-md flex justify-center mb-8">
          <button
            onClick={isAdding ? resetForm : () => setIsAdding(true)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-sm ${
              isAdding 
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
              : 'bg-brand-primary text-white hover:bg-gray-800'
            }`}
          >
            {isAdding ? <X size={18} /> : <Plus size={18} />}
            {isAdding ? 'Hủy' : 'Thêm Link mới'}
          </button>
        </div>
      )}

      {/* Add Link Form (Only for creating new) */}
      <AnimatePresence>
        {isAdminView && isAdding && !editingId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-md mb-8 overflow-hidden"
          >
            <form onSubmit={handleAddLink} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-4">
              <h2 className="font-bold text-gray-800 text-lg mb-2 flex items-center gap-2">
                <Plus size={20} className="text-brand-accent" />
                Thêm Link mới
              </h2>
              {/* Form Fields Component would be better but let's keep it simple for now */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tiêu đề</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Khóa học AI miễn phí"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition-all font-medium"
                  value={newLink.title}
                  onChange={e => setNewLink({...newLink, title: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Đường dẫn (URL)</label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="url" 
                    required
                    placeholder="https://..."
                    className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-medium"
                    value={newLink.url}
                    onChange={e => setNewLink({...newLink, url: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kiểu hiển thị</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium"
                    value={newLink.type}
                    onChange={e => setNewLink({...newLink, type: e.target.value as any})}
                  >
                    <option value="card">Thẻ (Có mô tả)</option>
                    <option value="button">Nút (Gọn nhẹ)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Icon</label>
                  <select 
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none font-medium"
                    value={newLink.icon}
                    onChange={e => setNewLink({...newLink, icon: e.target.value as any})}
                  >
                    <option value="affiliate">Giỏ hàng</option>
                    <option value="web">Website</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="social">Smartphone</option>
                  </select>
                </div>
              </div>

              {newLink.type === 'card' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả ngắn</label>
                  <textarea 
                    placeholder="Giới thiệu nhanh về link này..."
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-20 resize-none font-medium"
                    value={newLink.description}
                    onChange={e => setNewLink({...newLink, description: e.target.value})}
                  />
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-100"
              >
                Lưu Link
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links List */}
      <div className="w-full max-w-md space-y-4 mb-20 px-1">
        <AnimatePresence mode="popLayout">
          {links.map((link) => {
            const IconComponent = getIconComponent(link.icon);
            const isEditingThis = editingId === link.id;

            return (
              <motion.div
                key={link.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                {isAdminView && isEditingThis ? (
                  /* Inline Edit Form */
                  <motion.form 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleAddLink} 
                    className="bg-white p-5 rounded-2xl shadow-lg border-2 border-brand-accent space-y-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                       <h3 className="font-bold text-gray-800">Chỉnh sửa Link</h3>
                       <button type="button" onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>

                    <div className="space-y-4">
                      {/* Tiêu đề */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Tiêu đề</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Tiêu đề"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                          value={newLink.title}
                          onChange={e => setNewLink({...newLink, title: e.target.value})}
                        />
                      </div>

                      {/* URL */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Đường dẫn (URL)</label>
                        <input 
                          type="url" 
                          required
                          placeholder="URL"
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm font-medium focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
                          value={newLink.url}
                          onChange={e => setNewLink({...newLink, url: e.target.value})}
                        />
                      </div>
                      
                      {/* Cấu hình hiển thị và Icon */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 font-sans">Kiểu hiển thị</label>
                          <select 
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold focus:ring-2 focus:ring-brand-accent/20"
                            value={newLink.type}
                            onChange={e => setNewLink({...newLink, type: e.target.value as any})}
                          >
                            <option value="card">Thẻ (Mô tả)</option>
                            <option value="button">Nút (Gọn)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1 font-sans">Biểu tượng (Icon)</label>
                          <select 
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold focus:ring-2 focus:ring-brand-accent/20"
                            value={newLink.icon}
                            onChange={e => setNewLink({...newLink, icon: e.target.value as any})}
                          >
                            <option value="affiliate">Giỏ hàng</option>
                            <option value="web">Website</option>
                            <option value="facebook">Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="youtube">YouTube</option>
                            <option value="tiktok">TikTok</option>
                          </select>
                        </div>
                      </div>

                      {/* Mô tả */}
                      {newLink.type === 'card' && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Mô tả (Tùy chọn)</label>
                          <textarea 
                            placeholder="Mô tả"
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none h-16 resize-none text-sm focus:ring-2 focus:ring-brand-accent/20 transition-all font-sans"
                            value={newLink.description}
                            onChange={e => setNewLink({...newLink, description: e.target.value})}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                       <button 
                        type="submit"
                        className="flex-1 py-2.5 bg-brand-accent text-white font-bold rounded-xl hover:bg-blue-600 transition-colors text-sm"
                      >
                        Cập nhật
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => deleteLink(e, link.id)}
                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  /* Regular Link Card */
                  <>
                    {/* Admin Actions */}
                    {isAdminView && (
                      <div className="absolute -right-2 -top-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startEdit(link);
                          }}
                          className="p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 active:scale-95 transition-all"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => deleteLink(e, link.id)}
                          className="p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 active:scale-95 transition-all"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    {link.type === 'card' ? (
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item block p-5 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-brand-accent/40 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-blue-50 text-brand-accent rounded-xl group-hover/item:bg-brand-accent group-hover/item:text-white transition-colors">
                            <IconComponent size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover/item:text-brand-accent transition-colors">
                              {link.title}
                            </h3>
                            {link.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {link.description}
                              </p>
                            )}
                          </div>
                          <ExternalLink size={14} className="text-gray-300 mt-1" />
                        </div>
                      </a>
                    ) : (
                      <a 
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 font-semibold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent size={18} />
                          <span>{link.title}</span>
                        </div>
                        <ExternalLink size={16} className="opacity-40 group-hover/item:opacity-100" />
                      </a>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {links.length === 0 && !isAdding && (
          <div className="text-center py-12 text-gray-400">
            <LinkIcon size={48} className="mx-auto mb-4 opacity-10" />
            <p>Chưa có link nào. Hãy thêm link đầu tiên!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center">
        <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">
          Powered by BioFlow
        </p>
      </footer>

      {/* Toast Notifications */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-[280px]">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-sm font-semibold backdrop-blur-md ${
                toast.type === 'success' ? 'bg-green-500/90 text-white border-green-400' :
                toast.type === 'error' ? 'bg-red-500/90 text-white border-red-400' :
                'bg-gray-900/90 text-white border-gray-700'
              }`}
            >
              <div className="p-1 bg-white/20 rounded-lg">
                {toast.type === 'success' && <Check size={14} />}
                {toast.type === 'error' && <Trash2 size={14} />}
                {toast.type === 'info' && <LinkIcon size={14} />}
              </div>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isAdminView && isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
            onClick={() => setIsProfileModalOpen(false)}
          >
            <motion.form
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              onSubmit={(e) => {
                handleUpdateProfile(e);
                setIsProfileModalOpen(false);
              }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-100 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-lg">Cập nhật thông tin hồ sơ</h3>
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avatar URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-medium"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tên hiển thị</label>
                <input
                  type="text"
                  placeholder="Tên của bạn"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-accent outline-none font-medium"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mô tả</label>
                <textarea
                  placeholder="Mô tả ngắn"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none h-20 resize-none font-medium"
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-accent text-white font-semibold hover:bg-blue-600 transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}

        {isAdminView && pendingDeleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-4"
            onClick={cancelDelete}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
              <p className="text-sm text-gray-600 mb-5">
                Bạn có chắc chắn muốn xóa item này không?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
                >
                  Xóa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
