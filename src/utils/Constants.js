/**
 * Physical constants and reference values for planetary calculations
 */

// Universal physical constants
export const GRAVITATIONAL_CONSTANT = 6.674e-11; // m³/(kg·s²)
export const BOLTZMANN_CONSTANT = 1.380649e-23; // J/K
export const STEFAN_BOLTZMANN = 5.670374419e-8; // W/(m²·K⁴)

// Gas molecular weights (kg/mol)
export const MOLECULAR_WEIGHTS = {
  H2: 0.002016,   // Hydrogen
  He: 0.004003,   // Helium
  N2: 0.028014,   // Nitrogen
  O2: 0.031998,   // Oxygen
  CO2: 0.04401,   // Carbon Dioxide
  Ar: 0.039948,   // Argon
  CH4: 0.016043,  // Methane
  H2O: 0.018015   // Water vapor
};

// Known planet reference values for testing and presets
export const EARTH = {
  mass: 5.972e24,      // kg
  radius: 6371,        // km
  density: 5515,       // kg/m³
  gravity: 9.81,       // m/s²
  rotationRate: 24,    // hours
  axialTilt: 23.5,     // degrees
  escapeVelocity: 11.2 // km/s
};

export const MARS = {
  mass: 6.4171e23,     // kg
  radius: 3389.5,      // km
  density: 3934,       // kg/m³
  gravity: 3.71,       // m/s²
  rotationRate: 24.6,  // hours
  axialTilt: 25.2,     // degrees
  escapeVelocity: 5.03 // km/s
};

export const JUPITER = {
  mass: 1.898e27,      // kg
  radius: 69911,       // km
  density: 1326,       // kg/m³
  gravity: 24.79,      // m/s²
  rotationRate: 9.9,   // hours
  axialTilt: 3.13,     // degrees
  escapeVelocity: 59.5 // km/s
};

export const MOON = {
  mass: 7.342e22,      // kg
  radius: 1737.4,      // km
  density: 3344,       // kg/m³
  gravity: 1.62,       // m/s²
  rotationRate: 655.7, // hours (27.3 days)
  axialTilt: 6.68,     // degrees
  escapeVelocity: 2.38 // km/s
};

// Parameter ranges for validation
export const PARAMETER_RANGES = {
  mass: { min: 1e20, max: 1e30 },          // kg
  radius: { min: 100, max: 100000 },       // km
  density: { min: 500, max: 15000 },       // kg/m³
  rotationRate: { min: 0.1, max: 1000 },   // hours
  axialTilt: { min: 0, max: 180 }          // degrees
};

// Albedo values for different surface types
export const ALBEDO_VALUES = {
  FRESH_SNOW: 0.85,
  ICE: 0.6,
  DESERT: 0.3,
  FOREST: 0.15,
  OCEAN: 0.06,
  ROCK: 0.25
};
