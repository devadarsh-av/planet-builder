/**
 * Compositional parameters that define the atmosphere and surface composition of a planet
 */
class CompositionParameters {
  /**
   * Creates a new CompositionParameters instance
   * @param {Object} params - Parameter object
   * @param {Object} params.atmosphere - Atmospheric parameters
   * @param {Object} params.atmosphere.composition - Gas composition percentages
   * @param {number} params.atmosphere.pressure - Surface atmospheric pressure in atm
   * @param {number} params.atmosphere.thickness - Height of atmosphere in km
   * @param {Object} params.water - Water parameters
   * @param {number} params.water.coverage - Percentage of surface covered by water
   * @param {number} params.water.depth - Average ocean depth in km
   * @param {number} params.water.iceCaps - Percentage of water frozen at poles
   * @param {Object} params.surface - Surface parameters
   * @param {number} params.surface.albedo - Surface reflectivity (0-1)
   * @param {number} params.surface.temperature - Average surface temperature in K
   */
  constructor({ atmosphere, water, surface }) {
    // Validate parameters
    const validation = validateCompositionParams({ atmosphere, water, surface });
    if (!validation.isValid) {
      throw new Error(`Invalid composition parameters: ${validation.errors.join(', ')}`);
    }

    this.atmosphere = {
      composition: atmosphere.composition || { N2: 78, O2: 21, Ar: 0.93, CO2: 0.04, other: 0.03 },
      pressure: atmosphere.pressure,
      thickness: atmosphere.thickness
    };

    this.water = {
      coverage: water.coverage,
      depth: water.depth,
      iceCaps: water.iceCaps
    };

    this.surface = {
      albedo: surface.albedo,
      temperature: surface.temperature
    };
  }

  /**
   * Calculate the dominant atmospheric gas
   * @returns {string} Name of the dominant gas
   */
  getDominantGas() {
    let maxPercentage = 0;
    let dominantGas = 'unknown';

    for (const [gas, percentage] of Object.entries(this.atmosphere.composition)) {
      if (percentage > maxPercentage) {
        maxPercentage = percentage;
        dominantGas = gas;
      }
    }

    return dominantGas;
  }

  /**
   * Get atmosphere color based on composition
   * @returns {Array<number>} RGB color array [r, g, b] (0-1 range)
   */
  getAtmosphereColor() {
    const comp = this.atmosphere.composition;

    // Earth-like (high O2 and N2) - blue
    if (comp.N2 > 60 && comp.O2 > 15) {
      return [0.3, 0.6, 1.0]; // Light blue
    }

    // CO2 dominated (like Venus/Mars) - orange/red
    if (comp.CO2 > 50) {
      return [1.0, 0.5, 0.3]; // Orange-red
    }

    // Methane dominated (like Titan) - orange
    if (comp.CH4 && comp.CH4 > 30) {
      return [1.0, 0.7, 0.4]; // Orange
    }

    // High nitrogen, low oxygen (like Titan) - amber
    if (comp.N2 > 80 && (!comp.O2 || comp.O2 < 5)) {
      return [1.0, 0.8, 0.5]; // Amber
    }

    // Default - pale blue
    return [0.5, 0.7, 0.9];
  }

  /**
   * Calculate greenhouse effect temperature increase
   * Based on CO2 and other greenhouse gas concentrations
   * @returns {number} Temperature increase in Kelvin
   */
  calculateGreenhouseEffect() {
    const comp = this.atmosphere.composition;
    const pressure = this.atmosphere.pressure;

    // Simple model: more CO2 and pressure = more warming
    const co2Factor = (comp.CO2 || 0) / 100;
    const ch4Factor = (comp.CH4 || 0) / 100;
    const pressureFactor = Math.log(Math.max(0.01, pressure));

    // Greenhouse gases contribute to warming
    const greenhouseWarming = (co2Factor * 30 + ch4Factor * 20) * pressureFactor;

    return greenhouseWarming;
  }

  /**
   * Calculate effective temperature including greenhouse effect
   * @returns {number} Effective surface temperature in K
   */
  getEffectiveTemperature() {
    return this.surface.temperature + this.calculateGreenhouseEffect();
  }

  /**
   * Check if atmosphere can support liquid water
   * @returns {boolean} True if conditions allow liquid water
   */
  canSupportLiquidWater() {
    const temp = this.getEffectiveTemperature();
    const pressure = this.atmosphere.pressure;

    // Water is liquid between 273K and 373K at 1 atm
    // Adjust for pressure (simplified)
    const minTemp = 273 - (1 - pressure) * 10;
    const maxTemp = 373 + (pressure - 1) * 20;

    return temp >= minTemp && temp <= maxTemp && pressure > 0.006;
  }

  /**
   * Get ocean color based on composition and depth
   * @returns {number} Hex color for ocean rendering
   */
  getOceanColor() {
    const depth = this.water.depth;
    const temp = this.getEffectiveTemperature();

    // Frozen water (ice) - white/light blue
    if (temp < 273 || this.water.iceCaps > 80) {
      return 0xddeeff;
    }

    // Deep ocean - dark blue
    if (depth > 5) {
      return 0x0a1a3a;
    }

    // Medium depth - blue
    if (depth > 1) {
      return 0x1a4d7a;
    }

    // Shallow water - light blue
    return 0x4a8dba;
  }

  /**
   * Returns a formatted string of all parameters
   * @returns {string} Formatted parameter information
   */
  toString() {
    const dominant = this.getDominantGas();
    const greenhouse = this.calculateGreenhouseEffect();
    const effectiveTemp = this.getEffectiveTemperature();
    const canHaveWater = this.canSupportLiquidWater();

    return `
Composition Parameters:

Atmosphere:
  Composition: ${JSON.stringify(this.atmosphere.composition)}
  Dominant Gas: ${dominant}
  Pressure: ${this.atmosphere.pressure.toFixed(2)} atm
  Thickness: ${this.atmosphere.thickness.toFixed(1)} km
  Greenhouse Effect: +${greenhouse.toFixed(1)} K

Water:
  Coverage: ${this.water.coverage.toFixed(1)}%
  Depth: ${this.water.depth.toFixed(2)} km
  Ice Caps: ${this.water.iceCaps.toFixed(1)}%

Surface:
  Albedo: ${this.surface.albedo.toFixed(2)}
  Base Temperature: ${this.surface.temperature.toFixed(1)} K
  Effective Temperature: ${effectiveTemp.toFixed(1)} K
  Can Support Liquid Water: ${canHaveWater ? 'Yes' : 'No'}
    `.trim();
  }
}

/**
 * Validates composition parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validateCompositionParams(params) {
  const errors = [];

  // Validate atmosphere
  if (!params.atmosphere) {
    errors.push('Atmosphere parameters are required');
  } else {
    // Validate composition percentages sum to ~100%
    if (params.atmosphere.composition) {
      const total = Object.values(params.atmosphere.composition).reduce((sum, val) => sum + val, 0);
      if (Math.abs(total - 100) > 1) {
        errors.push(`Atmospheric composition must sum to 100% (currently ${total.toFixed(1)}%)`);
      }

      // Check individual percentages
      for (const [gas, percentage] of Object.entries(params.atmosphere.composition)) {
        if (percentage < 0 || percentage > 100) {
          errors.push(`${gas} percentage must be between 0 and 100`);
        }
      }
    }

    // Validate pressure
    if (params.atmosphere.pressure !== undefined) {
      if (params.atmosphere.pressure < 0 || params.atmosphere.pressure > 100) {
        errors.push('Atmospheric pressure must be between 0 and 100 atm');
      }
    } else {
      errors.push('Atmospheric pressure is required');
    }

    // Validate thickness
    if (params.atmosphere.thickness !== undefined) {
      if (params.atmosphere.thickness < 0 || params.atmosphere.thickness > 1000) {
        errors.push('Atmospheric thickness must be between 0 and 1000 km');
      }
    } else {
      errors.push('Atmospheric thickness is required');
    }
  }

  // Validate water
  if (!params.water) {
    errors.push('Water parameters are required');
  } else {
    if (params.water.coverage < 0 || params.water.coverage > 100) {
      errors.push('Water coverage must be between 0 and 100%');
    }

    if (params.water.depth < 0 || params.water.depth > 100) {
      errors.push('Water depth must be between 0 and 100 km');
    }

    if (params.water.iceCaps < 0 || params.water.iceCaps > 100) {
      errors.push('Ice caps must be between 0 and 100%');
    }
  }

  // Validate surface
  if (!params.surface) {
    errors.push('Surface parameters are required');
  } else {
    if (params.surface.albedo < 0 || params.surface.albedo > 1) {
      errors.push('Albedo must be between 0 and 1');
    }

    if (params.surface.temperature < 0 || params.surface.temperature > 1000) {
      errors.push('Temperature must be between 0 and 1000 K');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Default Earth-like composition
export const EARTH_COMPOSITION = {
  atmosphere: {
    composition: {
      N2: 78.08,
      O2: 20.95,
      Ar: 0.93,
      CO2: 0.04
    },
    pressure: 1.0,
    thickness: 100
  },
  water: {
    coverage: 71,
    depth: 3.7,
    iceCaps: 3
  },
  surface: {
    albedo: 0.3,
    temperature: 288
  }
};

// Mars-like composition
export const MARS_COMPOSITION = {
  atmosphere: {
    composition: {
      CO2: 95.32,
      N2: 2.7,
      Ar: 1.6,
      O2: 0.13,
      other: 0.25
    },
    pressure: 0.006,
    thickness: 11
  },
  water: {
    coverage: 0,
    depth: 0,
    iceCaps: 100
  },
  surface: {
    albedo: 0.25,
    temperature: 210
  }
};

// Venus-like composition
export const VENUS_COMPOSITION = {
  atmosphere: {
    composition: {
      CO2: 96.5,
      N2: 3.5
    },
    pressure: 92,
    thickness: 250
  },
  water: {
    coverage: 0,
    depth: 0,
    iceCaps: 0
  },
  surface: {
    albedo: 0.75,
    temperature: 737
  }
};

export default CompositionParameters;
