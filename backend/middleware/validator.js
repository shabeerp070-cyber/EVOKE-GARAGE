/**
 * Validate incoming booking request data
 */
export const validateBookingData = (req, res, next) => {
  const body = req.body || {};

  // Extract canonical or alias fields
  const fullName = (body.fullName || body.name || '').trim();
  const phoneNumber = (body.phoneNumber || body.phone || '').trim();
  const carBrandModel = (body.carBrandModel || body.vehicle || body.car || '').trim();
  const selectedService = (body.selectedService || body.service || '').trim();
  const problemDescription = (body.problemDescription || body.notes || body.description || '').trim();
  const preferredBookingDate = (body.preferredBookingDate || body.preferredDate || body.date || '').trim();

  const errors = [];

  // 1. Full name validation
  if (!fullName) {
    errors.push({ field: 'fullName', message: 'Full name is required' });
  } else if (fullName.length < 2) {
    errors.push({ field: 'fullName', message: 'Full name must be at least 2 characters' });
  } else if (fullName.length > 100) {
    errors.push({ field: 'fullName', message: 'Full name cannot exceed 100 characters' });
  }

  // 2. Phone number validation
  const phoneRegex = /^[0-9+()\s-]{7,20}$/;
  if (!phoneNumber) {
    errors.push({ field: 'phoneNumber', message: 'Phone number is required' });
  } else if (!phoneRegex.test(phoneNumber)) {
    errors.push({ field: 'phoneNumber', message: 'Please enter a valid phone number (min 7 digits)' });
  }

  // 3. Selected service validation
  if (!selectedService) {
    errors.push({ field: 'selectedService', message: 'Selected service is required' });
  } else if (selectedService.length > 120) {
    errors.push({ field: 'selectedService', message: 'Service name cannot exceed 120 characters' });
  }

  // 4. Car brand and model validation (optional but length check)
  if (carBrandModel.length > 120) {
    errors.push({ field: 'carBrandModel', message: 'Vehicle specification cannot exceed 120 characters' });
  }

  // 5. Problem description validation (optional but length check)
  if (problemDescription.length > 1000) {
    errors.push({ field: 'problemDescription', message: 'Problem description cannot exceed 1000 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors,
    });
  }

  // Attach normalized payload to request
  req.validatedBooking = {
    fullName,
    phoneNumber,
    carBrandModel: carBrandModel || 'To be confirmed',
    selectedService,
    problemDescription: problemDescription || 'General inspection & consultation request',
    preferredBookingDate: preferredBookingDate || 'Earliest available atelier slot',
  };

  next();
};

