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
│   │   ├── Planet.ts              # Main planet class
│   │   └── SimulationEngine.ts    # Core simulation loop
│   ├── parameters/
│   │   ├── PhysicalParams.ts      # Mass, radius, density, gravity
│   │   ├── CompositionParams.ts   # Water, atmosphere, surface composition
│   │   └── AdvancedParams.ts      # Volcanoes, magnetic field, tectonics
│   ├── physics/
│   │   ├── GravityCalculator.ts   # Gravitational calculations
│   │   ├── AtmosphereModel.ts     # Atmospheric simulation
│   │   └── ThermalModel.ts        # Temperature and heat transfer
│   ├── rendering/
│   │   ├── PlanetRenderer.ts      # Visual representation
│   │   └── EffectsRenderer.ts     # Atmosphere, clouds, auroras
│   ├── ui/
│   │   ├── ParameterControls.ts   # UI for parameter manipulation
│   │   └── Visualization.ts       # Data visualization components
│   └── utils/
│       ├── Constants.ts            # Physical constants
│       └── Validation.ts           # Parameter validation
├── public/
├── tests/
└── docs/
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

# Type checking
npm run type-check

# Build for production
npm run build
```

## Code Style

### TypeScript Guidelines

- Use strict TypeScript mode
- Prefer interfaces over types for object shapes
- Use enums for fixed sets of values (e.g., `ActivityLevel`, `TectonicState`)
- Document all public APIs with JSDoc comments

### Example: Parameter Interface

```typescript
/**
 * Physical parameters that define the basic structure of a planet
 */
export interface PhysicalParameters {
  /** Total mass of the planet in kilograms */
  mass: number;

  /** Planetary radius in kilometers */
  radius: number;

  /** Average density in kg/m³ */
  density: number;

  /** Rotational period in hours */
  rotationRate: number;

  /** Axial tilt in degrees (0-180) */
  axialTilt: number;
}

/**
 * Validates physical parameters and calculates derived properties
 */
export function validatePhysicalParams(params: PhysicalParameters): ValidationResult {
  // Implementation
}
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

```typescript
describe('PhysicalParameters', () => {
  it('should calculate correct surface gravity', () => {
    const params: PhysicalParameters = {
      mass: 5.972e24, // Earth mass
      radius: 6371,   // Earth radius in km
      // ... other params
    };

    const gravity = calculateSurfaceGravity(params);
    expect(gravity).toBeCloseTo(9.81, 1);
  });
});
```

## Performance Considerations

- Use web workers for heavy physics calculations
- Implement level-of-detail for rendering
- Cache calculated values when parameters haven't changed
- Consider using GPU acceleration for particle effects (volcanic plumes, aurora)

## Debugging

### Debug Mode

Enable debug mode to see:
- Parameter validation warnings
- Physics calculation intermediate steps
- Render performance metrics
- Real-time parameter value displays

```typescript
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

1. Start with the parameter interface definitions
2. Implement validation logic
3. Add physics calculations
4. Create tests
5. Update UI controls
6. Add documentation

## Questions?

For technical questions or clarifications, please open an issue on the GitHub repository.
