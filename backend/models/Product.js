import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    partNumber: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Part number cannot exceed 50 characters'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      enum: [
        'Exhaust & Downpipes',
        'Braking & Rotors',
        'Suspension & Coilovers',
        'Aerodynamics & Carbon Fiber',
        'Engine & Performance Tuning',
        'Lighting & Optics',
        'Wheels & Wheel Spacers',
        'Interior & Telemetry',
        'Atelier Maintenance & Fluids',
      ],
      default: 'Exhaust & Downpipes',
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be a positive amount'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    stockStatus: {
      type: String,
      enum: ['In Stock', 'Pre-Order', 'Out of Stock'],
      default: 'In Stock',
    },
    image: {
      type: String,
      required: [true, 'Product image is required'],
      trim: true,
    },
    compatibility: {
      type: String,
      trim: true,
      default: 'Universal / High Performance Specification',
      maxlength: [200, 'Compatibility info cannot exceed 200 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual id serialization
productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

export const Product = mongoose.model('Product', productSchema);

