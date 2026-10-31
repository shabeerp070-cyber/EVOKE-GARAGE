/**
 * EVOKE GARAGE - Official Atelier Booking API Service
 * Handles communication with the Express/MongoDB backend.
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/**
 * Submit booking consultation to backend API
 * 
 * @param {Object} bookingData
 * @param {string} bookingData.fullName
 * @param {string} bookingData.phoneNumber
 * @param {string} bookingData.carBrandModel
 * @param {string} bookingData.selectedService
 * @param {string} [bookingData.problemDescription]
 * @param {string} [bookingData.preferredBookingDate]
 * @returns {Promise<{ success: boolean, booking: Object, whatsapp: Object }>}
 */
export async function submitBooking(bookingData) {
  const endpoint = `${API_BASE_URL}/api/bookings`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const errorMessage =
        data?.message ||
        (data?.errors && data.errors.map((e) => e.message).join(', ')) ||
        `Backend server error (Status: ${response.status})`;

      const error = new Error(errorMessage);
      error.details = data?.errors || [];
      error.statusCode = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('❌ [BOOKING API ERROR]:', error);
    throw error;
  }
}

