import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Upload,
  RefreshCw,
  ExternalLink,
  MessageSquare,
  Search,
  Eye,
  EyeOff,
  Phone,
  Car,
  Clock,
  Sparkles,
  ArrowLeft,
  X,
} from 'lucide-react';
import {
  loginAdmin,
  getAdminToken,
  clearAdminAuth,
  isAdminAuthenticated,
  fetchAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminBookings,
  updateBookingStatus,
  deleteAdminBooking,
  getStoredAdminUser,
} from '../services/adminApi';
import { siteConfig } from '../config/siteConfig';

const CATEGORIES = [
  'Exhaust & Downpipes',
  'Braking & Rotors',
  'Suspension & Coilovers',
  'Aerodynamics & Carbon Fiber',
  'Engine & Performance Tuning',
  'Lighting & Optics',
  'Wheels & Wheel Spacers',
  'Interior & Telemetry',
  'Atelier Maintenance & Fluids',
];

export default function AdminPanel({ onExitToWebsite }) {
  const [isAuthenticated, setIsAuthenticated] = useState(isAdminAuthenticated());
  const [adminUser, setAdminUser] = useState(getStoredAdminUser());

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'bookings'
  const [products, setProducts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Add mode
  const [productForm, setProductForm] = useState({
    name: '',
    category: CATEGORIES[0],
    price: '',
    description: '',
    stockStatus: 'In Stock',
    compatibility: '',
    partNumber: '',
    image: '',
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormError, setProductFormError] = useState('');

  // Booking detail / filter state
  const [bookingFilter, setBookingFilter] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Load initial dashboard data if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, activeTab]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      if (activeTab === 'products') {
        const pList = await fetchAdminProducts();
        setProducts(pList);
      } else if (activeTab === 'bookings') {
        const bList = await fetchAdminBookings();
        setBookings(bList);
      }
    } catch (err) {
      if (err.message.includes('expired') || err.message.includes('Unauthorized')) {
        setIsAuthenticated(false);
        clearAdminAuth();
      }
    } finally {
      setLoadingData(false);
    }
  };

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setLoginError('Please provide both username and password.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const data = await loginAdmin(loginIdentifier.trim(), loginPassword.trim());
      setIsAuthenticated(true);
      setAdminUser(data.admin);
      setLoginPassword('');
      showToast('Admin authorized successfully.');
    } catch (err) {
      setLoginError(err.message || 'Invalid administrative credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    clearAdminAuth();
    setIsAuthenticated(false);
    setAdminUser(null);
    showToast('Logged out of administrative portal.');
  };

  // Open Product Modal (Add Mode)
  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: CATEGORIES[0],
      price: '',
      description: '',
      stockStatus: 'In Stock',
      compatibility: '',
      partNumber: '',
      image: '',
      isActive: true,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setProductFormError('');
    setIsProductModalOpen(true);
  };

  // Open Product Modal (Edit Mode)
  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      category: product.category,
      price: product.price,
      description: product.description || '',
      stockStatus: product.stockStatus || 'In Stock',
      compatibility: product.compatibility || '',
      partNumber: product.partNumber || '',
      image: product.image || '',
      isActive: product.isActive !== undefined ? product.isActive : true,
    });
    setSelectedFile(null);
    setPreviewUrl(product.image || '');
    setProductFormError('');
    setIsProductModalOpen(true);
  };

  // Handle File Input Change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name.trim()) {
      setProductFormError('Product name is required.');
      return;
    }

    if (!productForm.price || isNaN(Number(productForm.price))) {
      setProductFormError('Please enter a valid price amount.');
      return;
    }

    if (!selectedFile && !productForm.image.trim()) {
      setProductFormError('Please upload an image or provide an image URL.');
      return;
    }

    setIsSavingProduct(true);
    setProductFormError('');

    try {
      // Use FormData to support multipart image file uploads
      const formData = new FormData();
      formData.append('name', productForm.name.trim());
      formData.append('category', productForm.category);
      formData.append('price', Number(productForm.price));
      formData.append('description', productForm.description.trim());
      formData.append('stockStatus', productForm.stockStatus);
      formData.append('compatibility', productForm.compatibility.trim());
      formData.append('partNumber', productForm.partNumber.trim());
      formData.append('isActive', productForm.isActive);

      if (selectedFile) {
        formData.append('image', selectedFile);
      } else if (productForm.image) {
        formData.append('image', productForm.image.trim());
      }

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id || editingProduct._id, formData);
        showToast('Product updated successfully.');
      } else {
        await createAdminProduct(formData);
        showToast('New product added to catalog.');
      }

      setIsProductModalOpen(false);
      loadDashboardData();
    } catch (err) {
      setProductFormError(err.message || 'Failed to save product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}" from the catalog?`)) {
      return;
    }

    try {
      await deleteAdminProduct(productId);
      showToast(`"${productName}" removed.`);
      loadDashboardData();
    } catch (err) {
      alert(`Could not delete product: ${err.message}`);
    }
  };

  // Update Booking Status
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      showToast(`Booking status set to ${newStatus}`);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId || b._id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert(`Could not update status: ${err.message}`);
    }
  };

  // Delete Booking
  const handleDeleteBooking = async (bookingId, clientName) => {
    if (!window.confirm(`Delete booking consultation record for "${clientName}"?`)) return;

    try {
      await deleteAdminBooking(bookingId);
      showToast('Booking deleted.');
      setBookings((prev) => prev.filter((b) => b.id !== bookingId && b._id !== bookingId));
    } catch (err) {
      alert(`Could not delete booking: ${err.message}`);
    }
  };

  // Open Direct WhatsApp reply to customer
  const replyCustomerViaWhatsApp = (booking) => {
    const rawPhone = (booking.phoneNumber || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const refCode = (booking.id || booking._id || '').slice(-6).toUpperCase();

    const msg = [
      `Hello ${booking.fullName},`,
      `Thank you for reaching out to EVOKE GARAGE regarding your consultation request (#EVK-${refCode}).`,
      `We have reviewed your vehicle (${booking.carBrandModel}) and required service (${booking.selectedService}).`,
      `We would be pleased to schedule your slot at our Ottapalam Atelier on ${booking.preferredBookingDate || 'your preferred date'}.`,
      '',
      'EVOKE GARAGE — Automotive Atelier, Ottapalam, Palakkad',
    ].join('\n');

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ============================================================================
  // VIEW 1: ADMIN LOGIN SCREEN (If not authenticated)
  // ============================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full bg-[#070709] text-white flex flex-col justify-center items-center px-4 py-12 select-none">
        {/* Top return link */}
        <div className="absolute top-6 left-6">
          <button
            onClick={onExitToWebsite}
            className="flex items-center gap-2 text-xs font-tech uppercase tracking-wider text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </button>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md bg-[#0e0e12] border border-white/20 p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.95)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
            <div className="w-10 h-10 rounded-full bg-white/10 p-1 flex items-center justify-center ring-1 ring-white/20">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-tech text-[#888888] tracking-[0.25em] uppercase block font-bold">
                PROTECTED ACCESS
              </span>
              <h2 className="text-xl font-heading font-black uppercase text-white tracking-wider">
                ATELIER ADMIN PORTAL
              </h2>
            </div>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-tech flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-2 font-bold">
                Admin Username or Email
              </label>
              <input
                type="text"
                required
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="admin"
                className="w-full px-4 py-3 bg-black border border-white/20 text-white font-tech text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors rounded-none"
              />
            </div>

            <div>
              <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-2 font-bold">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-3 bg-black border border-white/20 text-white font-tech text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white transition-colors rounded-none pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-forge-primary w-full !min-h-[50px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingIn ? (
                  <span>AUTHENTICATING SESSION...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>AUTHORIZE ACCESS</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <span className="text-[11px] font-tech text-zinc-500 uppercase tracking-widest block">
              EVOKE GARAGE — DOWN-DRAFT ATELIER OTTAPALAM
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ============================================================================
  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter !== 'All' && b.status !== bookingFilter) return false;
    if (bookingSearch) {
      const q = bookingSearch.toLowerCase();
      const match =
        b.fullName?.toLowerCase().includes(q) ||
        b.phoneNumber?.includes(q) ||
        b.carBrandModel?.toLowerCase().includes(q) ||
        b.selectedService?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen w-full bg-[#070709] text-white flex flex-col select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white text-black px-5 py-3 font-tech text-xs uppercase tracking-wider font-bold shadow-2xl flex items-center gap-2 border border-black animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-black/95 border-b border-white/15 px-4 sm:px-8 py-4 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/10 ring-1 ring-white/20 p-1 flex items-center justify-center">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-xs font-tech text-zinc-400 uppercase tracking-widest font-bold block">
              EVOKE GARAGE ATELIER
            </span>
            <h1 className="text-sm sm:text-base font-heading font-black uppercase text-white tracking-wider">
              ADMINISTRATIVE CONTROL CONSOLE
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onExitToWebsite}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 border border-white/20 text-xs font-tech uppercase tracking-wider text-zinc-300 hover:text-white hover:border-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-xs font-tech text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Admin: {adminUser?.username || 'admin'}</span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-red-950/60 border border-red-500/40 text-xs font-tech font-bold uppercase tracking-wider text-red-200 hover:bg-red-900/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border ${
                activeTab === 'products'
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                  : 'bg-black text-zinc-400 border-white/15 hover:text-white hover:border-white/40'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Car Parts Products</span>
              <span
                className={`ml-1 px-2 py-0.2 text-[10px] rounded-full ${
                  activeTab === 'products' ? 'bg-black text-white' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {products.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-tech font-bold uppercase tracking-wider transition-all cursor-pointer rounded-none border ${
                activeTab === 'bookings'
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                  : 'bg-black text-zinc-400 border-white/15 hover:text-white hover:border-white/40'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Customer Bookings</span>
              <span
                className={`ml-1 px-2 py-0.2 text-[10px] rounded-full ${
                  activeTab === 'bookings' ? 'bg-black text-white' : 'bg-white/10 text-zinc-300'
                }`}
              >
                {bookings.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loadingData}
              className="p-2 border border-white/15 text-zinc-400 hover:text-white hover:border-white cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>

            {activeTab === 'products' && (
              <button
                onClick={openAddProductModal}
                className="btn-forge-primary !min-h-[42px] !py-2 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: PRODUCT MANAGEMENT                                           */}
        {/* ==================================================================== */}
        {activeTab === 'products' && (
          <div>
            {products.length === 0 && !loadingData ? (
              <div className="py-20 text-center border border-white/10 bg-black/40 p-8">
                <Package className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                <h3 className="text-xl font-heading font-black uppercase text-white">NO PRODUCTS REGISTERED</h3>
                <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">
                  Your car parts catalog is currently empty. Click "Add Product" to create your first component listing.
                </p>
                <button onClick={openAddProductModal} className="mt-5 btn-forge-primary !min-h-[44px] !px-6 text-xs uppercase">
                  Add First Product
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => {
                  const isOutOfStock = p.stockStatus === 'Out of Stock';
                  const isPreOrder = p.stockStatus === 'Pre-Order';

                  return (
                    <div
                      key={p.id || p._id}
                      className="bg-[#0e0e12] border border-white/15 p-5 flex flex-col justify-between"
                    >
                      <div>
                        {/* Thumbnail */}
                        <div className="aspect-[16/10] bg-black/60 overflow-hidden border border-white/10 mb-4 relative">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = '/images/car-paint-detail.jpg';
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            <span
                              className={`px-2 py-0.5 text-[9px] font-tech uppercase tracking-wider font-bold border ${
                                isOutOfStock
                                  ? 'bg-red-950/80 border-red-500 text-red-200'
                                  : isPreOrder
                                  ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                                  : 'bg-black/80 border-emerald-500 text-emerald-300'
                              }`}
                            >
                              {p.stockStatus}
                            </span>
                          </div>
                          {!p.isActive && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[9px] font-tech uppercase font-bold">
                              Hidden
                            </div>
                          )}
                        </div>

                        {/* Category & Part Code */}
                        <div className="flex items-center justify-between text-[11px] font-tech text-zinc-400 uppercase tracking-wider mb-1">
                          <span>{p.category}</span>
                          <span>{p.partNumber || '—'}</span>
                        </div>

                        {/* Title */}
                        <h3 className="font-heading font-bold text-base uppercase text-white line-clamp-2">
                          {p.name}
                        </h3>

                        {/* Compatibility */}
                        <p className="text-xs font-tech text-zinc-400 mt-1 line-clamp-1">
                          Fitment: {p.compatibility || 'Universal'}
                        </p>

                        {/* Price */}
                        <div className="mt-3 text-lg font-tech font-bold text-white">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
                        <button
                          onClick={() => openEditProductModal(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-white/20 text-xs font-tech uppercase tracking-wider text-zinc-300 hover:text-white hover:border-white cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeleteProduct(p.id || p._id, p.name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/50 border border-red-500/30 text-xs font-tech uppercase tracking-wider text-red-300 hover:bg-red-900/60 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: CUSTOMER BOOKINGS                                            */}
        {/* ==================================================================== */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter and Search */}
            <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilter(st)}
                    className={`px-3.5 py-1.5 text-xs font-tech uppercase tracking-wider cursor-pointer border ${
                      bookingFilter === st
                        ? 'bg-white text-black border-white font-bold'
                        : 'bg-black text-zinc-400 border-white/15 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[260px]">
                <input
                  type="text"
                  placeholder="Search client, phone or vehicle..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-black border border-white/20 text-white text-xs font-tech placeholder:text-zinc-500 focus:outline-none focus:border-white"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="py-20 text-center border border-white/10 bg-black/40 p-8">
                <Calendar className="w-12 h-12 text-zinc-500 mx-auto mb-3" />
                <h3 className="text-xl font-heading font-black uppercase text-white">NO BOOKINGS FOUND</h3>
                <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto">
                  No consultation records match the active status or search query.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((b) => {
                  const bId = b.id || b._id;
                  const refCode = bId.slice(-6).toUpperCase();
                  const createdDate = new Date(b.bookingCreationDate || b.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={bId}
                      className="bg-[#0e0e12] border border-white/15 p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-2.5 py-0.5 bg-white/10 border border-white/15 text-xs font-tech tracking-wider text-white font-bold">
                            #EVK-{refCode}
                          </span>
                          <span className="text-xs font-tech text-zinc-400">{createdDate}</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-tech uppercase tracking-wider font-bold border ${
                              b.status === 'Completed'
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                                : b.status === 'Confirmed'
                                ? 'bg-blue-950/60 border-blue-500 text-blue-300'
                                : b.status === 'Cancelled'
                                ? 'bg-red-950/60 border-red-500 text-red-300'
                                : 'bg-amber-950/60 border-amber-500 text-amber-300'
                            }`}
                          >
                            {b.status || 'Pending'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-widest block font-bold">
                              Client Name
                            </span>
                            <span className="text-base font-heading font-bold text-white uppercase">
                              {b.fullName}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-widest block font-bold">
                              Phone Number
                            </span>
                            <a
                              href={`tel:${b.phoneNumber}`}
                              className="text-sm font-tech text-zinc-200 hover:text-white flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{b.phoneNumber}</span>
                            </a>
                          </div>

                          <div>
                            <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-widest block font-bold">
                              Vehicle Specification
                            </span>
                            <span className="text-sm font-tech text-zinc-200 flex items-center gap-1.5">
                              <Car className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{b.carBrandModel || 'To be confirmed'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 text-xs font-tech text-zinc-300 border-t border-white/5 flex flex-col sm:flex-row sm:items-center gap-3">
                          <div>
                            <strong className="text-zinc-400 uppercase tracking-wider">Discipline:</strong>{' '}
                            <span className="text-white">{b.selectedService}</span>
                          </div>
                          <div>
                            <strong className="text-zinc-400 uppercase tracking-wider">Preferred Date:</strong>{' '}
                            <span className="text-white">{b.preferredBookingDate || 'Flexible'}</span>
                          </div>
                        </div>

                        {b.problemDescription && (
                          <p className="text-xs text-zinc-400 font-normal italic bg-black/40 p-2.5 border border-white/5">
                            "{b.problemDescription}"
                          </p>
                        )}
                      </div>

                      {/* Booking Actions */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2.5 lg:min-w-[200px] border-t lg:border-t-0 pt-4 lg:pt-0 border-white/10">
                        {/* Quick WhatsApp Reply */}
                        <button
                          onClick={() => replyCustomerViaWhatsApp(b)}
                          className="btn-forge-primary !min-h-[40px] !py-2 !px-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-white group-hover:text-black" />
                          <span>WhatsApp Reply</span>
                        </button>

                        {/* Status Select */}
                        <select
                          value={b.status || 'Pending'}
                          onChange={(e) => handleStatusChange(bId, e.target.value)}
                          className="px-3 py-2 bg-black border border-white/20 text-white text-xs font-tech uppercase tracking-wider cursor-pointer focus:outline-none"
                        >
                          <option value="Pending">Status: Pending</option>
                          <option value="Confirmed">Status: Confirmed</option>
                          <option value="Completed">Status: Completed</option>
                          <option value="Cancelled">Status: Cancelled</option>
                        </select>

                        {/* Delete Booking */}
                        <button
                          onClick={() => handleDeleteBooking(bId, b.fullName)}
                          className="px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-950/40 text-xs font-tech uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Delete Record
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* ==================================================================== */}
      {/* PRODUCT ADD / EDIT MODAL                                             */}
      {/* ==================================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[#0e0e12] border border-white/25 p-6 sm:p-8 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h3 className="text-xl font-heading font-black uppercase text-white">
                {editingProduct ? 'EDIT CAR PART PRODUCT' : 'ADD NEW CAR PART PRODUCT'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {productFormError && (
              <div className="mb-5 p-3.5 bg-red-950/70 border border-red-500/50 text-red-200 text-xs font-tech flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{productFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inconel 625 Valvetronic Exhaust System"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-sm font-tech focus:outline-none focus:border-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                    Category *
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-xs font-tech uppercase tracking-wider focus:outline-none focus:border-white cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="185000"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-sm font-tech focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                    Stock Availability *
                  </label>
                  <select
                    value={productForm.stockStatus}
                    onChange={(e) => setProductForm({ ...productForm, stockStatus: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-xs font-tech uppercase tracking-wider focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Pre-Order">Pre-Order</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                    Part Number / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EVK-EXH-01"
                    value={productForm.partNumber}
                    onChange={(e) => setProductForm({ ...productForm, partNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-sm font-tech focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                  Vehicle Compatibility
                </label>
                <input
                  type="text"
                  placeholder="e.g. Porsche 911 GT3 (992) / BMW M3 Competition"
                  value={productForm.compatibility}
                  onChange={(e) => setProductForm({ ...productForm, compatibility: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-sm font-tech focus:outline-none focus:border-white"
                />
              </div>

              {/* Product Image Upload Section */}
              <div>
                <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                  Product Image *
                </label>
                
                <div className="border border-dashed border-white/30 p-4 text-center bg-black/50 hover:border-white/60 transition-colors">
                  {previewUrl ? (
                    <div className="space-y-3">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-40 object-cover border border-white/15"
                      />
                      <label className="inline-block px-3 py-1.5 bg-white text-black text-xs font-tech uppercase font-bold cursor-pointer">
                        Change Image File
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/jpg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                      <p className="text-xs font-tech text-zinc-300 uppercase tracking-wider mb-2">
                        Upload Product Photography (JPEG, PNG, WebP — Max 5MB)
                      </p>
                      <label className="inline-block px-4 py-2 bg-white text-black text-xs font-tech uppercase font-bold cursor-pointer">
                        Select Image File
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/webp, image/jpg"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-center text-xs font-tech text-zinc-500 uppercase">
                  — or enter image path/URL below —
                </div>
                <input
                  type="text"
                  placeholder="/images/car-paint-detail.jpg or https://..."
                  value={productForm.image}
                  onChange={(e) => {
                    setProductForm({ ...productForm, image: e.target.value });
                    if (!selectedFile) setPreviewUrl(e.target.value);
                  }}
                  className="mt-1 w-full px-3 py-2 bg-black border border-white/20 text-white text-xs font-tech focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs font-tech uppercase tracking-widest text-zinc-400 mb-1.5 font-bold">
                  Description & Specifications
                </label>
                <textarea
                  rows={3}
                  placeholder="Material specs, weight savings, acoustic tuning, dyno gains..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-black border border-white/20 text-white text-xs font-tech focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-white"
                />
                <label htmlFor="isActive" className="text-xs font-tech text-zinc-300 uppercase tracking-wider cursor-pointer">
                  Visible on Public Customer Website
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 border border-white/20 text-xs font-tech uppercase tracking-wider text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="btn-forge-primary !min-h-[44px] !py-2.5 !px-6 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {isSavingProduct ? 'SAVING COMPONENT...' : editingProduct ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

