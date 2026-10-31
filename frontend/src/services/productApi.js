import { siteConfig } from '../config/siteConfig';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Fetch all active car parts products for the public catalog
 */
export async function getPublicProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'All') {
    query.set('category', params.category);
  }
  if (params.search) {
    query.set('search', params.search);
  }

  const endpoint = `${API_BASE_URL}/api/products${query.toString() ? `?${query.toString()}` : ''}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load products (Status: ${res.status})`);
    }

    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error('❌ [PRODUCTS API ERROR]:', error);
    throw error;
  }
}

/**
 * Fetch a single active product by ID for the public customer website
 */
export async function getSinglePublicProduct(id) {
  const endpoint = `${API_BASE_URL}/api/products/${id}`;

  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to load product (Status: ${res.status})`);
    }

    const data = await res.json();
    return data.product || null;
  } catch (error) {
    console.error(`❌ [SINGLE PRODUCT API ERROR]:`, error);
    throw error;
  }
}

/**
 * Construct pre-filled WhatsApp Enquiry URL for a product
 * Exact format: "Hello EVOKE GARAGE, I am interested in [Product Name]. Please share more details and availability."
 */
export function getProductEnquiryUrl(product) {
  const rawNumber = siteConfig.contact.whatsappNumber || '911234567890';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
  const productName = product?.name || 'this automotive component';

  const message = `Hello EVOKE GARAGE, I am interested in ${productName}. Please share more details and availability.`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp with direct product enquiry pre-filled
 */
export function openProductEnquiryWhatsApp(product) {
  const url = getProductEnquiryUrl(product);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Construct pre-filled WhatsApp Buy / Inquire URL for a specific car part
 */
export function getProductWhatsAppUrl(product, customNotes = '') {
  const rawNumber = siteConfig.contact.whatsappNumber || '911234567890';
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

  const formattedPrice = Number(product.price).toLocaleString('en-IN');
  const partCode = product.partNumber || `EVK-PART-${(product._id || product.id || '').slice(-6).toUpperCase()}`;

  const message = [
    '*EVOKE GARAGE — CAR PART ORDER / INQUIRY*',
    `• Product: ${product.name}`,
    `• Part Number: ${partCode}`,
    `• Price: ₹${formattedPrice} (INR)`,
    `• Category: ${product.category}`,
    `• Availability: ${product.stockStatus || 'In Stock'}`,
    `• Compatibility: ${product.compatibility || 'High Performance'}`,
    customNotes ? `• Customer Notes: ${customNotes}` : null,
    '• Atelier: Ottapalam, Palakkad, Kerala',
    '',
    'Hello EVOKE GARAGE, I would like to order / check availability for this car part. Please confirm fitting and dispatch schedule.',
  ]
    .filter(Boolean)
    .join('\n');

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Open WhatsApp with product order pre-filled
 */
export function buyViaWhatsApp(product, customNotes = '') {
  const url = getProductWhatsAppUrl(product, customNotes);
  window.open(url, '_blank');
}

