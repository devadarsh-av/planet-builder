# Developer Documentation

## Overview

Planet Builder is a simulation engine that allows users to create and manipulate planets through various physical, compositional, and advanced parameters. The simulation provides real-time visualization and physics-based calculations.

## Architecture

### Core Systems

The project is organized around three main parameter systems:

1. **Physical Parameters** - Basic planetary characteristics
2. **Compositional Parameters** - Atmospheric and surface composition
3. **Advanced Parameters** - Complex geological and magnetic features

### System Design

```
planet-builder/
├── src/
│   ├── core/
│   │   ├── Planet.js              # Main planet class
│   │   └── SimulationEngine.js    # Core simulation loop
│   ├── parameters/
│   │   ├── PhysicalParams.js      # Mass, radius, density, gravity
│   │   ├── CompositionParams.js   # Water, atmosphere, surface composition
│   │   └── AdvancedParams.js      # Volcanoes, magnetic field, tectonics
│   ├── physics/
│   │   ├── GravityCalculator.js   # Gravitational calculations
│   │   ├── AtmosphereModel.js     # Atmospheric simulation
│   │   └── ThermalModel.js        # Temperature and heat transfer
│   ├── rendering/
│   │   ├── PlanetRenderer.js      # Visual representation (Three.js)
│   │   └── EffectsRenderer.js     # Atmosphere, clouds, auroras
│   ├── ui/
│   │   ├── ParameterControls.js   # UI for parameter manipulation
│   │   └── Visualization.js       # Data visualization components
│   └── utils/
│       ├── Constants.js            # Physical constants
│       └── Validation.js           # Parameter validation
├── public/
│   ├── textures/                   # Planet textures
│   ├── models/                     # 3D models
│   └── index.html                  # Main HTML file
├── tests/
├── docs/
└── package.json
```

## Parameter Systems

### 1. Physical Parameters

These define the basic structure and properties of the planet:

- **Mass** - Total mass of the planet (kg)
- **Radius** - Planetary radius (km)
- **Density** - Average density (kg/m³)
- **Rotation Rate** - Rotational period (hours)
- **Axial Tilt** - Angle of rotation axis (degrees)
- **Surface Gravity** - Calculated from mass and radius (m/s²)
- **Escape Velocity** - Minimum velocity to escape gravity (km/s)

**Implementation Notes:**
- Surface gravity and escape velocity should be calculated automatically
- Validate that density is consistent with mass and radius
- Consider presets for Earth-like, Mars-like, Jupiter-like planets

### 2. Compositional Parameters

These define what the planet is made of:

#### Atmosphere
- **Composition** - Gas percentages (N₂, O₂, CO₂, etc.)
- **Pressure** - Surface atmospheric pressure (atm)
- **Thickness** - Height of atmosphere (km)
- **Greenhouse Effect** - Temperature increase from greenhouse gases (°C)

#### Water
- **Coverage** - Percentage of surface covered by water (%)
- **Depth** - Average ocean depth (km)
- **Salinity** - Salt concentration (g/L)
- **Ice Caps** - Percentage of water frozen at poles (%)

#### Surface
- **Composition** - Rock types, minerals
- **Albedo** - Surface reflectivity (0-1)
- **Temperature** - Average surface temperature (K)

**Implementation Notes:**
- Atmosphere composition percentages should sum to 100%
- Water parameters affect surface temperature and albedo
- Consider atmospheric retention based on gravity and temperature

### 3. Advanced Parameters

These add geological and magnetic complexity:

#### Volcanic Activity
- **Activity Level** - None, Low, Moderate, High, Extreme
- **Volcano Count** - Number of active volcanoes
- **Eruption Frequency** - Average time between eruptions
- **Lava Composition** - Basaltic, Andesitic, Rhyolitic
- **Gas Emissions** - SO₂, CO₂, H₂O vapor release rates

#### Magnetic Field
- **Field Strength** - Magnetic field intensity (Tesla)
- **Dynamo Active** - Whether core generates magnetic field
- **Pole Alignment** - Magnetic vs. rotational pole offset (degrees)
- **Field Shape** - Dipole, quadrupole, or irregular

#### Plate Tectonics
- **Tectonic Activity** - Active, Inactive, or Stagnant Lid
- **Plate Count** - Number of major tectonic plates
- **Movement Rate** - Average plate velocity (cm/year)
- **Mountain Building** - Orogeny rate and locations

**Implementation Notes:**
- Magnetic field depends on core composition and rotation rate
- Volcanic activity affects atmosphere composition over time
- Plate tectonics influences surface features and volcanism

## Development Setup

### Prerequisites

```bash
node >= 16.0.0
npm >= 8.0.0
```

### Installation

```bash
npm install
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## Code Style

### JavaScript Guidelines

- Use ES6+ features (classes, modules, arrow functions, destructuring)
- Use `const` and `let` instead of `var`
- Use object constants for fixed sets of values (e.g., `ActivityLevel`, `TectonicState`)
- Document all public APIs with JSDoc comments
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for classes)
- Use async/await for asynchronous operations

### Example: Parameter Class

```javascript
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
    this.mass = mass;
    this.radius = radius;
    this.density = density;
    this.rotationRate = rotationRate;
    this.axialTilt = axialTilt;
  }

  /**
   * Calculates surface gravity
   * @returns {number} Surface gravity in m/s²
   */
  calculateSurfaceGravity() {
    const G = 6.674e-11; // Gravitational constant
    const radiusMeters = this.radius * 1000; // Convert km to m
    return (G * this.mass) / (radiusMeters ** 2);
  }

  /**
   * Calculates escape velocity
   * @returns {number} Escape velocity in km/s
   */
  calculateEscapeVelocity() {
    const G = 6.674e-11;
    const radiusMeters = this.radius * 1000;
    return Math.sqrt((2 * G * this.mass) / radiusMeters) / 1000; // Convert to km/s
  }
}

/**
 * Validates physical parameters
 * @param {Object} params - Parameters to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
export function validatePhysicalParams(params) {
  const errors = [];

  if (!params.mass || params.mass <= 0) {
    errors.push('Mass must be a positive number');
  }

  if (!params.radius || params.radius <= 0) {
    errors.push('Radius must be a positive number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export default PhysicalParameters;
```

## Physics Calculations

### Key Formulas

#### Surface Gravity
```
g = G * M / r²
```
Where:
- G = 6.674 × 10⁻¹¹ m³/(kg·s²)
- M = planet mass (kg)
- r = planet radius (m)

#### Escape Velocity
```
v_esc = √(2 * G * M / r)
```

#### Atmospheric Retention
A planet can retain an atmosphere if:
```
v_thermal < v_escape / 6
```
Where v_thermal is the root-mean-square velocity of gas molecules.

## Testing

### Unit Tests

- Test each parameter system independently
- Mock physics calculations for predictable results
- Test edge cases (extreme values, zero values)

### Integration Tests

- Test parameter interactions (e.g., how volcanism affects atmosphere)
- Test full simulation loops
- Verify conservation laws (mass, energy)

### Example Test

```javascript
import { describe, it, expect } from 'vitest'; // or jest
import PhysicalParameters from '../src/parameters/PhysicalParams.js';

describe('PhysicalParameters', () => {
  it('should calculate correct surface gravity', () => {
    const params = new PhysicalParameters({
      mass: 5.972e24,      // Earth mass in kg
      radius: 6371,        // Earth radius in km
      density: 5515,       // Earth density in kg/m³
      rotationRate: 24,    // 24 hours
      axialTilt: 23.5      // Earth's axial tilt
    });

    const gravity = params.calculateSurfaceGravity();
    expect(gravity).toBeCloseTo(9.81, 1);
  });

  it('should calculate correct escape velocity', () => {
    const params = new PhysicalParameters({
      mass: 5.972e24,
      radius: 6371,
      density: 5515,
      rotationRate: 24,
      axialTilt: 23.5
    });

    const escapeVelocity = params.calculateEscapeVelocity();
    expect(escapeVelocity).toBeCloseTo(11.2, 1); // Earth's escape velocity
  });
});
```

## Three.js Integration

### Setting Up the Renderer

The rendering system uses Three.js for 3D visualization. Here's a basic setup:

```javascript
import * as THREE from 'three';

class PlanetRenderer {
  constructor(containerId) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById(containerId).appendChild(this.renderer.domElement);

    this.camera.position.z = 5;
  }

  /**
   * Creates a planet mesh with the given parameters
   * @param {Object} params - Planet parameters
   * @returns {THREE.Mesh} The planet mesh
   */
  createPlanetMesh(params) {
    const geometry = new THREE.SphereGeometry(params.radius / 1000, 64, 64);
    const material = new THREE.MeshPhongMaterial({
      map: this.loadTexture(params.textureUrl),
      bumpMap: this.loadTexture(params.bumpMapUrl),
      specular: new THREE.Color('grey')
    });

    return new THREE.Mesh(geometry, material);
  }

  /**
   * Renders the scene
   */
  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
```

### Adding Atmospheric Effects

```javascript
/**
 * Creates an atmospheric glow effect around the planet
 * @param {number} radius - Planet radius
 * @param {string} color - Atmosphere color
 * @returns {THREE.Mesh} Atmosphere mesh
 */
function createAtmosphere(radius, color) {
  const geometry = new THREE.SphereGeometry(radius * 1.1, 64, 64);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    // Add custom shaders for atmospheric scattering
  });

  return new THREE.Mesh(geometry, material);
}
```

## Performance Considerations

- Use web workers for heavy physics calculations
- Implement level-of-detail (LOD) for rendering distant objects
- Cache calculated values when parameters haven't changed
- Consider using GPU acceleration for particle effects (volcanic plumes, aurora)
- Use Three.js instancing for rendering multiple similar objects
- Optimize geometry complexity based on camera distance

## Debugging

### Debug Mode

Enable debug mode to see:
- Parameter validation warnings
- Physics calculation intermediate steps
- Render performance metrics
- Real-time parameter value displays

```javascript
import Planet from './src/core/Planet.js';

const planet = new Planet(params, { debug: true });
```

## Future Enhancements

- [ ] Add orbital mechanics (moons, rings)
- [ ] Implement climate zones based on latitude and tilt
- [ ] Add life/habitability calculations
- [ ] Include asteroid impacts and cratering
- [ ] Add stellar radiation effects
- [ ] Implement time-lapse evolution (geological timescales)
- [ ] Add data export (CSV, JSON)
- [ ] Create parameter presets for known planets

## Resources

### Scientific References

- NASA Planetary Fact Sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
- Physics equations: Standard gravitational parameter, Stefan-Boltzmann law
- Atmospheric models: Ideal gas law, barometric formula

### Libraries to Consider

- **Three.js** - 3D rendering
- **D3.js** - Data visualization
- **Math.js** - Mathematical operations
- **Web Workers API** - Background calculations

## Contributing

See the main README.md for contribution guidelines. When implementing new features:

1. Start with the parameter class definitions and structure
2. Implement validation logic with JSDoc documentation
3. Add physics calculations
4. Create unit tests
5. Update UI controls
6. Add documentation

## Questions?

For technical questions or clarifications, please open an issue on the GitHub repository.
