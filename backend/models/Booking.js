import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    // Full name of customer
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },

    // Phone number
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[0-9+()\s-]{7,20}$/,
        'Please enter a valid phone number',
      ],
    },

    // Car brand and model (e.g. "Porsche 911 GT3 RS", "BMW M3", "Challenger")
    carBrandModel: {
      type: String,
      trim: true,
      default: 'To be confirmed',
      maxlength: [120, 'Vehicle specification cannot exceed 120 characters'],
    },

    // Selected service / Atelier discipline
    selectedService: {
      type: String,
      required: [true, 'Selected service is required'],
      trim: true,
      maxlength: [120, 'Service name cannot exceed 120 characters'],
    },

    // Problem description / notes / customer goals
    problemDescription: {
      type: String,
      trim: true,
      default: 'General inspection & consultation request',
      maxlength: [1000, 'Problem description cannot exceed 1000 characters'],
    },

    // Preferred booking date
    preferredBookingDate: {
      type: String,
      trim: true,
      default: 'Earliest available atelier slot',
    },

    // Booking status (default: Pending)
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    // Booking creation date and auto-update timestamp
    timestamps: { createdAt: 'bookingCreationDate', updatedAt: 'updatedAt' },
  }
);

// Add virtual 'id' representation for clean client serialization
bookingSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const Booking = mongoose.model('Booking', bookingSchema);

