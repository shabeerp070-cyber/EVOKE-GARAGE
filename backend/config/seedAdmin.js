import { Admin } from '../models/Admin.js';
import { Product } from '../models/Product.js';

/**
 * Seed default administrator and initial sample parts if collections are empty
 */
export const seedInitialData = async () => {
  try {
    // 1. Seed Administrator Account if empty
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const username = process.env.ADMIN_USERNAME || 'admin';
      const email = process.env.ADMIN_EMAIL || 'admin@evokegarage.com';
      const password = process.env.ADMIN_PASSWORD || 'Evoke@Admin2026!';

      await Admin.create({
        username,
        email,
        password,
        role: 'superadmin',
      });

      console.log(`🔐 [ADMIN SEED]: Initial administrative account created!`);
      console.log(`   Username: ${username} | Email: ${email}`);
    }

    // 2. Seed Initial Car Parts Catalog if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        {
          name: 'Inconel 625 Titanium Valvetronic Cat-Back Exhaust',
          partNumber: 'EVK-EXH-INC625',
          category: 'Exhaust & Downpipes',
          price: 185000,
          description: 'Handcrafted ultra-lightweight Inconel 625 exhaust system with dual electronic exhaust valves, laser-etched carbon fiber quad tips, and tuned Helmholtz acoustic chambers.',
          stockStatus: 'In Stock',
          compatibility: 'Porsche 911 (992 GT3 / Carrera S) / BMW M3 G80',
          image: '/images/car-paint-detail.jpg',
          isActive: true,
        },
        {
          name: 'Dry Pre-Preg Carbon Fiber Front Aerodynamic Splitter & Canards',
          partNumber: 'EVK-AERO-SPLIT01',
          category: 'Aerodynamics & Carbon Fiber',
          price: 92000,
          description: 'Autoclave-cured 2x2 twill carbon fiber front aero lip with integrated air brake vortex generators. High-gloss UV clearcoat finish engineered to prevent yellowing.',
          stockStatus: 'In Stock',
          compatibility: 'BMW M3 (G80/G81) / BMW M4 (G82)',
          image: '/images/car_body_polishing_craft.jpg',
          isActive: true,
        },
        {
          name: 'Brembo GTR Billet Monobloc 6-Piston Racing Brake System',
          partNumber: 'EVK-BRK-GTR6P',
          category: 'Braking & Rotors',
          price: 245000,
          description: 'Forged aircraft-grade aluminium monobloc calipers with ventilated titanium pistons, 380mm curved-vane slotted floating two-piece discs, and high-friction carbon-metallic pads.',
          stockStatus: 'In Stock',
          compatibility: 'Track & High-Performance European Chassis',
          image: '/images/showcase-2.jpg',
          isActive: true,
        },
        {
          name: 'KW Clubsport 3-Way Adjustable Inverted Coilover System',
          partNumber: 'EVK-SUS-KW3WAY',
          category: 'Suspension & Coilovers',
          price: 168000,
          description: 'Motorsport-derived 3-way independently adjustable damping for low-speed and high-speed compression and rebound. Includes forged top mounts with camber adjustability.',
          stockStatus: 'Pre-Order',
          compatibility: 'Porsche 718 Cayman GT4 / BMW M2 Competition',
          image: '/images/showcase-3.jpg',
          isActive: true,
        },
        {
          name: 'Precision Billet CNC High-Flow Intake Manifold & Charge Pipes',
          partNumber: 'EVK-ENG-CNC600',
          category: 'Engine & Performance Tuning',
          price: 78000,
          description: 'CAD-optimized dual plenum billet manifold with integrated methanol injection ports and thermal heat-reflective gold barrier wrapping.',
          stockStatus: 'In Stock',
          compatibility: 'Turbocharged 3.0L Inline-6 / V6 Platforms',
          image: '/images/engine_bay_bonnet.jpg',
          isActive: true,
        },
        {
          name: 'Forged Monoblock Centre-Lock Lightweight Atelier Wheels (Set of 4)',
          partNumber: 'EVK-WHL-FORG20',
          category: 'Wheels & Wheel Spacers',
          price: 320000,
          description: '6061-T6 aerospace forged monoblock construction weighing just 8.4kg per corner. Finished in signature Satin Shadowline Gunmetal.',
          stockStatus: 'In Stock',
          compatibility: 'Staggered 20x9.5J Front / 21x12J Rear',
          image: '/images/showcase-1.jpg',
          isActive: true,
        },
      ];

      await Product.insertMany(sampleProducts);
      console.log(`📦 [PRODUCT SEED]: Initial 6 car parts seeded into catalog!`);
    }
  } catch (error) {
    console.warn(`⚠️  [SEED WARNING]: Could not seed initial data: ${error.message}`);
  }
};

