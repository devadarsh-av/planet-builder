import { describe, it, expect } from 'vitest';
import PhysicalParameters, { validatePhysicalParams } from '../src/parameters/PhysicalParams.js';
import { EARTH, MARS, JUPITER, MOON } from '../src/utils/Constants.js';

describe('PhysicalParameters', () => {
  describe('Construction and Validation', () => {
    it('should create a valid PhysicalParameters instance with Earth values', () => {
      const params = new PhysicalParameters(EARTH);
      expect(params.mass).toBe(EARTH.mass);
      expect(params.radius).toBe(EARTH.radius);
      expect(params.density).toBe(EARTH.density);
      expect(params.rotationRate).toBe(EARTH.rotationRate);
      expect(params.axialTilt).toBe(EARTH.axialTilt);
    });

    it('should throw error for negative mass', () => {
      expect(() => {
        new PhysicalParameters({
          mass: -1000,
          radius: 6371,
          density: 5515,
          rotationRate: 24,
          axialTilt: 23.5
        });
      }).toThrow();
    });

    it('should throw error for zero radius', () => {
      expect(() => {
        new PhysicalParameters({
          mass: 5.972e24,
          radius: 0,
          density: 5515,
          rotationRate: 24,
          axialTilt: 23.5
        });
      }).toThrow();
    });

    it('should throw error for invalid axial tilt', () => {
      expect(() => {
        new PhysicalParameters({
          mass: 5.972e24,
          radius: 6371,
          density: 5515,
          rotationRate: 24,
          axialTilt: 200 // > 180
        });
      }).toThrow();
    });
  });

  describe('Surface Gravity Calculations', () => {
    it('should calculate correct surface gravity for Earth', () => {
      const earth = new PhysicalParameters(EARTH);
      const gravity = earth.calculateSurfaceGravity();
      expect(gravity).toBeCloseTo(9.81, 1);
    });

    it('should calculate correct surface gravity for Mars', () => {
      const mars = new PhysicalParameters(MARS);
      const gravity = mars.calculateSurfaceGravity();
      expect(gravity).toBeCloseTo(3.71, 1);
    });

    it('should calculate correct surface gravity for Jupiter', () => {
      const jupiter = new PhysicalParameters(JUPITER);
      const gravity = jupiter.calculateSurfaceGravity();
      // Gas giants have approximate "surface" gravity at 1 bar pressure level
      // Our calculation gives ~25.92 based on the mass and radius
      expect(gravity).toBeGreaterThan(20);
      expect(gravity).toBeLessThan(30);
    });

    it('should calculate correct surface gravity for Moon', () => {
      const moon = new PhysicalParameters(MOON);
      const gravity = moon.calculateSurfaceGravity();
      expect(gravity).toBeCloseTo(1.62, 1);
    });
  });

  describe('Escape Velocity Calculations', () => {
    it('should calculate correct escape velocity for Earth', () => {
      const earth = new PhysicalParameters(EARTH);
      const escapeVel = earth.calculateEscapeVelocity();
      expect(escapeVel).toBeCloseTo(11.2, 1);
    });

    it('should calculate correct escape velocity for Mars', () => {
      const mars = new PhysicalParameters(MARS);
      const escapeVel = mars.calculateEscapeVelocity();
      expect(escapeVel).toBeCloseTo(5.03, 1);
    });

    it('should calculate correct escape velocity for Jupiter', () => {
      const jupiter = new PhysicalParameters(JUPITER);
      const escapeVel = jupiter.calculateEscapeVelocity();
      // Gas giants have approximate escape velocity measurements
      // Our calculation gives ~60.2 based on the mass and radius
      expect(escapeVel).toBeGreaterThan(55);
      expect(escapeVel).toBeLessThan(65);
    });

    it('should calculate correct escape velocity for Moon', () => {
      const moon = new PhysicalParameters(MOON);
      const escapeVel = moon.calculateEscapeVelocity();
      expect(escapeVel).toBeCloseTo(2.38, 1);
    });
  });

  describe('Volume Calculations', () => {
    it('should calculate volume correctly', () => {
      const earth = new PhysicalParameters(EARTH);
      const volume = earth.calculateVolume();
      const expectedVolume = (4 / 3) * Math.PI * (EARTH.radius ** 3);
      expect(volume).toBeCloseTo(expectedVolume, 0);
    });
  });

  describe('Density Consistency', () => {
    it('should verify density is consistent for Earth', () => {
      const earth = new PhysicalParameters(EARTH);
      expect(earth.isDensityConsistent()).toBe(true);
    });
  });

  describe('Validation Function', () => {
    it('should validate correct parameters', () => {
      const result = validatePhysicalParams(EARTH);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject missing mass', () => {
      const result = validatePhysicalParams({
        radius: 6371,
        density: 5515,
        rotationRate: 24,
        axialTilt: 23.5
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject out of range values', () => {
      const result = validatePhysicalParams({
        mass: 1e40, // Too large
        radius: 6371,
        density: 5515,
        rotationRate: 24,
        axialTilt: 23.5
      });
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('getCalculatedProperties', () => {
    it('should return all calculated properties', () => {
      const earth = new PhysicalParameters(EARTH);
      const props = earth.getCalculatedProperties();

      expect(props).toHaveProperty('surfaceGravity');
      expect(props).toHaveProperty('escapeVelocity');
      expect(props).toHaveProperty('volume');
      expect(props).toHaveProperty('densityConsistent');

      expect(props.surfaceGravity).toBeCloseTo(9.81, 1);
      expect(props.escapeVelocity).toBeCloseTo(11.2, 1);
    });
  });

  describe('toString', () => {
    it('should return formatted string with all parameters', () => {
      const earth = new PhysicalParameters(EARTH);
      const str = earth.toString();

      expect(str).toContain('Planet Physical Parameters');
      expect(str).toContain('Mass:');
      expect(str).toContain('Radius:');
      expect(str).toContain('Surface Gravity:');
      expect(str).toContain('Escape Velocity:');
    });
  });
});
