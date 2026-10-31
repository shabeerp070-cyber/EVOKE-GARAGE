/**
 * EVOKE GARAGE - Official Site Configuration
 * 
 * Central configuration file for all brand, location, contact, and service details.
 * Any updates made here will automatically reflect across the entire website.
 */

export const siteConfig = {
  brand: {
    name: "EVOKE GARAGE",
    headline: "PRECISION IN EVERY DETAIL.",
    supportingText: "Professional Car Painting, Denting & Automotive Care.",
    subHeadline: "ENGINEERED WITH PRECISION. RESTORED WITH PASSION.",
    tagline: "EAST.93 AUTOMOTIVE CRAFT",
    logo: "/logo-circle.png",
    logoCircle: "/logo-circle.png",
    logoWhite: "/logo-white.png",
    logoRaw: "/logo.jpg",
  },

  // Central Contact Configuration
  contact: {
    // Official Business Location
    locationName: "EVOKE GARAGE",
    town: "Ottapalam",
    district: "Palakkad",
    state: "Kerala",
    country: "India",
    formattedAddress: "EVOKE GARAGE, Ottapalam, Palakkad, Kerala, India",
    
    // Configurable Contact Number (Phone: 1234567890)
    phone: "1234567890",
    phoneDisplay: "+91 1234567890",
    phoneCallUrl: "tel:+911234567890",
    isPhoneVerified: false,

    // WhatsApp configuration
    whatsappNumber: "911234567890",
    whatsappMessage: "Hello EVOKE GARAGE, I would like to inquire about booking an automotive service in Ottapalam.",
    whatsappDefaultMessage: "Hello EVOKE GARAGE, I would like to inquire about booking an automotive service in Ottapalam.",

    // General Contact & Hours
    email: "contact@evokegarage.com",
    workingHours: {
      days: "Monday – Saturday",
      hours: "9:00 AM – 7:00 PM",
      note: "Sunday: Closed / Emergency Consultations by Appointment",
    },

    // Geo coordinates for Ottapalam, Palakkad, Kerala
    coordinates: {
      lat: 10.7745,
      lng: 76.3811,
      googleMapsSearchUrl: "https://www.google.com/maps/search/?api=1&query=EVOKE+GARAGE+Ottapalam+Palakkad+Kerala+India",
    }
  },

  // Hero Section Media
  hero: {
    image: "/images/hero-car.jpg",
    headline: "PRECISION IN EVERY DETAIL.",
    supportingText: "Professional Car Painting, Denting & Automotive Care.",
    buttonPrimary: "EXPLORE OUR SERVICES",
    buttonSecondary: "CONTACT EVOKE GARAGE",
  },

  // 3-Slide Image Showcase (Step 3 in reference visual rhythm)
  showcaseSlides: [
    {
      id: "slide-1",
      number: "01",
      title: "ATELIER CRAFT",
      subtitle: "SURGICAL FINISH & CONTRAST",
      description: "Every body contour is hand-prepped under high-CRI inspection lamps. From primer micro-sanding to flawless clearcoat application, our paint atelier delivers mirror-depth reflections.",
      image: "/images/showcase-1.jpg",
      tag: "PAINT ATELIER",
      specs: ["Downdraft climate booth", "Multi-stage wet sanding", "Spectrophotometer matching"]
    },
    {
      id: "slide-2",
      number: "02",
      title: "STRUCTURAL PURITY",
      subtitle: "PRECISION DENTING & METAL RECOVERY",
      description: "Restoring OEM tolerances with delicate paintless dent removal and heavy hydraulic chassis alignment. We preserve the authentic structural soul and character of every machine.",
      image: "/images/showcase-2.jpg",
      tag: "COACHCRAFT",
      specs: ["Paintless Dent Removal (PDR)", "Chassis bench alignment", "Anti-corrosion metal seal"]
    },
    {
      id: "slide-3",
      number: "03",
      title: "TECHNICAL MASTERY",
      subtitle: "ADVANCED DIAGNOSTICS & CLIMATE",
      description: "Computerized CAN-bus troubleshooting, bespoke wiring harness fabrication, and complete dual-zone A/C refrigerant recovery to guarantee uncompromising mechanical reliability.",
      image: "/images/showcase-3.jpg",
      tag: "TELEMETRY",
      specs: ["CAN-bus telemetry", "Automated R134a/R1234yf recovery", "Laser headlight calibration"]
    }
  ],

  // Large Statement Section (Step 4 in reference)
  largeStatement: {
    image: "/images/large-statement-car.jpg",
    kicker: "03 // UNCOMPROMISING STANDARDS",
    headline: "METICULOUS DOWN TO THE MICRON.",
    subtext: "Automotive craft that rejects shortcuts. Every vehicle that leaves EVOKE GARAGE in Ottapalam is built to command presence, engineered with passion, and perfected with precision.",
    stats: [
      { label: "FINISH STANDARDS", val: "100% HAND REFINED" },
      { label: "INSPECTION PROTOCOL", val: "36-POINT AUDIT" },
      { label: "FACILITY", val: "OTTAPALAM ATELIER" }
    ]
  },

  // The 4 Core Required Services (Step 5 in reference)
  services: [
    {
      index: "01",
      id: "car-painting",
      title: "CAR PAINTING",
      shortDescription: "Professional automotive painting and paint restoration.",
      fullDescription:
        "Specialized in high-end automotive refinishing, down-draft clean booth baking, multi-stage wet sanding, and bespoke color-matching. From classic muscle restorations to modern clearcoat perfection.",
      specs: [
        "Dust-free downdraft spray booth",
        "Spectrophotometer color formulation",
        "Multi-stage high-gloss clearcoat",
        "Full vehicle resprays & vintage panel blending"
      ],
      image: "/images/car-painting.jpg",
      accent: "PAINT ATELIER"
    },
    {
      index: "02",
      id: "denting-body-repair",
      title: "DENTING & BODY REPAIR",
      shortDescription: "Professional dent repair and automotive body restoration.",
      fullDescription:
        "Master metal shaping and structural alignment. Combining delicate paintless dent removal (PDR) with heavy chassis squaring, rust elimination, and authentic vintage panel fabrication.",
      specs: [
        "Paintless Dent Removal (PDR)",
        "Precision chassis & frame alignment",
        "Custom metalwork & rust treatment",
        "OEM bodyline restoration"
      ],
      image: "/images/denting-body-repair.jpg",
      accent: "STRUCTURAL CRAFT"
    },
    {
      index: "03",
      id: "car-ac-work",
      title: "CAR A/C WORK",
      shortDescription: "Automotive air conditioning inspection, servicing, and repair.",
      fullDescription:
        "Complete automotive climate control engineering. Refrigerant gas recovery, vacuum leak diagnostics, compressor rebuilds, and deep antibacterial evaporator sanitization for optimal cabin performance.",
      specs: [
        "Automated R134a & R1234yf recovery & charging",
        "Electronic halogen & UV leak detection",
        "Compressor & magnetic clutch overhauls",
        "Dual-zone climate sensor calibration"
      ],
      image: "/images/car-ac-work.jpg",
      accent: "CLIMATE SYSTEMS"
    },
    {
      index: "04",
      id: "automotive-electrical",
      title: "AUTOMOTIVE ELECTRICAL WORK",
      shortDescription: "Electrical diagnostics, wiring repairs, lighting, and electrical system troubleshooting.",
      fullDescription:
        "Advanced vehicle electronic troubleshooting. Computerized CAN-bus telemetry, custom harness loom fabrication, starter & alternator rebuilding, and modern LED/laser headlight calibration.",
      specs: [
        "OBD-II & CAN-bus computerized telemetry",
        "Custom automotive wiring loom restoration",
        "Battery drain & charging system diagnostics",
        "Performance lighting & relay troubleshooting"
      ],
      image: "/images/automotive-electrical.jpg",
      accent: "ELECTRONIC DIAGNOSTICS"
    }
  ],

  // Curated High-End Workshop & Automotive Gallery (Step 6 in reference)
  gallery: [
    {
      id: "gal-1",
      title: "Muscle Workshop Hangar & Ambient Glow",
      category: "Restoration",
      image: "/images/gallery-1.jpg",
      aspect: "landscape"
    },
    {
      id: "gal-2",
      title: "Under-Bonnet Chassis & Mechanical Alignment",
      category: "Denting & Body Repair",
      image: "/images/gallery-2.jpg",
      aspect: "portrait"
    },
    {
      id: "gal-3",
      title: "Automotive Climate & A/C Compressor Diagnostics",
      category: "Car A/C Work",
      image: "/images/gallery-3.jpg",
      aspect: "landscape"
    },
    {
      id: "gal-4",
      title: "Precision Engine Bay Wiring & Diagnostics",
      category: "Electrical Work",
      image: "/images/gallery-4.jpg",
      aspect: "portrait"
    },
    {
      id: "gal-5",
      title: "Diagnostic Telemetry & Mechanical Inspection",
      category: "Electrical Work",
      image: "/images/gallery-5.jpg",
      aspect: "landscape"
    },
    {
      id: "gal-6",
      title: "Multi-Stage Paint Buffing & Mirror Clearcoat",
      category: "Car Painting",
      image: "/images/gallery-6.jpg",
      aspect: "landscape"
    }
  ]
};
