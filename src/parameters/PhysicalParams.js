import { GRAVITATIONAL_CONSTANT, PARAMETER_RANGES } from '../utils/Constants.js';

/**
 * Physical parameters that define the basic structure of a planet
 */
class PhysicalParameters {
  /**
   * Creates a new PhysicalParameters instance
   * @param {Object} params - Parameter object
   * @param {number} params.mass - Total mass of the planet in kilograms
   * @param {number} params.radius - Planetary radius in kilometers
   * @param {number} params.density - Average density in kg/m³
   * @param {number} params.rotationRate - Rotational period in hours
   * @param {number} params.axialTilt - Axial tilt in degrees (0-180)
   */
  constructor({ mass, radius, density, rotationRate, axialTilt }) {
    // Validate parameters
    const validation = validatePhysicalParams({ mass, radius, density, rotationRate, axialTilt });
    if (!validation.isValid) {
      throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
    }

    this.mass = mass;
    this.radius = radius;
    this.density = density;
    this.rotationRate = rotationRate;
    this.axialTilt = axialTilt;
  }

  /**
   * Calculates surface gravity using Newton's law of universal gravitation
   * Formula: g = G * M / r²
   * @returns {number} Surface gravity in m/s²
   */
  calculateSurfaceGravity() {
    const radiusMeters = this.radius * 1000; // Convert km to m
    const gravity = (GRAVITATIONAL_CONSTANT * this.mass) / (radiusMeters ** 2);
    return gravity;
  }

  /**
   * Calculates escape velocity
   * Formula: v_esc = √(2 * G * M / r)
   * @returns {number} Escape velocity in km/s
   */
  calculateEscapeVelocity() {
    const radiusMeters = this.radius * 1000; // Convert km to m
    const velocityMs = Math.sqrt((2 * GRAVITATIONAL_CONSTANT * this.mass) / radiusMeters);
    return velocityMs / 1000; // Convert m/s to km/s
  }

  /**
   * Calculates the volume of the planet
   * Formula: V = (4/3) * π * r³
   * @returns {number} Volume in km³
   */
  calculateVolume() {
    return (4 / 3) * Math.PI * (this.radius ** 3);
  }

  /**
   * Verifies if the density is consistent with mass and volume
   * @returns {boolean} True if density matches calculated value within 1% tolerance
   */
  isDensityConsistent() {
    const volumeKm3 = this.calculateVolume();
    const volumeM3 = volumeKm3 * 1e9; // Convert km³ to m³
    const calculatedDensity = this.mass / volumeM3;
    const tolerance = 0.01; // 1% tolerance
    const difference = Math.abs(calculatedDensity - this.density) / this.density;
    return difference <= tolerance;
  }

  /**
   * Returns all calculated properties as an object
   * @returns {Object} Object containing all derived properties
   */
  getCalculatedProperties() {
    return {
      surfaceGravity: this.calculateSurfaceGravity(),
      escapeVelocity: this.calculateEscapeVelocity(),
      volume: this.calculateVolume(),
      densityConsistent: this.isDensityConsistent()
    };
  }

  /**
   * Returns a formatted string of all parameters and calculated values
   * @returns {string} Formatted parameter information
   */
  toString() {
    const calculated = this.getCalculatedProperties();
    return `
Planet Physical Parameters:
  Mass: ${this.mass.toExponential(3)} kg
  Radius: ${this.radius.toFixed(1)} km
  Density: ${this.density.toFixed(1)} kg/m³
  Rotation Rate: ${this.rotationRate.toFixed(1)} hours
  Axial Tilt: ${this.axialTilt.toFixed(1)}°

Calculated Properties:
  Surface Gravity: ${calculated.surfaceGravity.toFixed(2)} m/s²
  Escape Velocity: ${calculated.escapeVelocity.toFixed(2)} km/s
  Volume: ${calculated.volume.toExponential(3)} km³
  Density Consistent: ${calculated.densityConsistent ? 'Yes' : 'No'}
    `.trim();
  }
}

/**
 * Validates physical parameters against acceptable ranges
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validatePhysicalParams(params) {
  const errors = [];

  // Check mass
  if (!params.mass || typeof params.mass !== 'number') {
    errors.push('Mass must be a number');
  } else if (params.mass <= 0) {
    errors.push('Mass must be positive');
  } else if (params.mass < PARAMETER_RANGES.mass.min || params.mass > PARAMETER_RANGES.mass.max) {
    errors.push(`Mass must be between ${PARAMETER_RANGES.mass.min} and ${PARAMETER_RANGES.mass.max} kg`);
  }

  // Check radius
  if (!params.radius || typeof params.radius !== 'number') {
    errors.push('Radius must be a number');
  } else if (params.radius <= 0) {
    errors.push('Radius must be positive');
  } else if (params.radius < PARAMETER_RANGES.radius.min || params.radius > PARAMETER_RANGES.radius.max) {
    errors.push(`Radius must be between ${PARAMETER_RANGES.radius.min} and ${PARAMETER_RANGES.radius.max} km`);
  }

  // Check density
  if (!params.density || typeof params.density !== 'number') {
    errors.push('Density must be a number');
  } else if (params.density <= 0) {
    errors.push('Density must be positive');
  } else if (params.density < PARAMETER_RANGES.density.min || params.density > PARAMETER_RANGES.density.max) {
    errors.push(`Density must be between ${PARAMETER_RANGES.density.min} and ${PARAMETER_RANGES.density.max} kg/m³`);
  }

  // Check rotation rate
  if (!params.rotationRate || typeof params.rotationRate !== 'number') {
    errors.push('Rotation rate must be a number');
  } else if (params.rotationRate <= 0) {
    errors.push('Rotation rate must be positive');
  } else if (params.rotationRate < PARAMETER_RANGES.rotationRate.min || params.rotationRate > PARAMETER_RANGES.rotationRate.max) {
    errors.push(`Rotation rate must be between ${PARAMETER_RANGES.rotationRate.min} and ${PARAMETER_RANGES.rotationRate.max} hours`);
  }

  // Check axial tilt
  if (params.axialTilt === undefined || typeof params.axialTilt !== 'number') {
    errors.push('Axial tilt must be a number');
  } else if (params.axialTilt < PARAMETER_RANGES.axialTilt.min || params.axialTilt > PARAMETER_RANGES.axialTilt.max) {
    errors.push(`Axial tilt must be between ${PARAMETER_RANGES.axialTilt.min} and ${PARAMETER_RANGES.axialTilt.max} degrees`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default PhysicalParameters;
