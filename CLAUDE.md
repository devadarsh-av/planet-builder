# CLAUDE.md - AI Assistant Development Guide

This file provides comprehensive context and guidelines for AI assistants (like Claude) to help build the Planet Builder project.

## Project Vision

Planet Builder is an interactive web-based simulation that allows users to create and customize planets by manipulating various physical, compositional, and advanced parameters. The simulation provides real-time 3D visualization using Three.js and calculates realistic physics-based effects.

### Core Goals

1. **Educational** - Help users understand planetary science and physics
2. **Interactive** - Real-time parameter manipulation with immediate visual feedback
3. **Realistic** - Physics-based calculations using real scientific formulas
4. **Beautiful** - Stunning 3D visuals with atmospheric effects, clouds, and geological features
5. **Accessible** - Intuitive UI that makes complex planetary science approachable

## Technical Stack

### Core Technologies

- **JavaScript (ES6+)** - Primary language, no TypeScript
- **Three.js** - 3D rendering and visualization
- **Vite** - Build tool and dev server (fast, modern)
- **Web Workers** - For heavy physics calculations
- **Vitest** - Testing framework (fast, Vite-native)

### Optional Libraries

- **D3.js** - For data visualization charts/graphs
- **dat.GUI** or **lil-gui** - Quick parameter controls during development
- **OrbitControls** (Three.js addon) - Camera controls for exploring the planet

### No Framework Needed Initially

Start with vanilla JavaScript. Can add React/Vue later if UI complexity demands it.

## Architecture Overview

### Module Structure

```
src/
├── core/              # Core engine classes
├── parameters/        # Parameter management
├── physics/           # Physics calculations
├── rendering/         # Three.js rendering
├── ui/                # User interface
└── utils/             # Helper functions
```

### Key Design Principles

1. **Separation of Concerns** - Physics, rendering, and UI are separate
2. **Event-Driven** - Parameters emit events when changed, triggering updates
3. **Lazy Calculation** - Only recalculate when parameters change
4. **Modular** - Each system can be developed and tested independently

## Parameter Systems - Detailed Specifications

### 1. Physical Parameters

These are the fundamental properties that define the planet's structure.

#### Required Parameters

| Parameter | Type | Unit | Range | Description |
|-----------|------|------|-------|-------------|
| mass | number | kg | 1e20 - 1e30 | Total planetary mass |
| radius | number | km | 100 - 100,000 | Planetary radius |
| density | number | kg/m³ | 500 - 15,000 | Average density |
| rotationRate | number | hours | 0.1 - 1000 | Rotational period |
| axialTilt | number | degrees | 0 - 180 | Axial tilt angle |

#### Derived Properties (Auto-calculated)

- **Surface Gravity** - g = G * M / r²
- **Escape Velocity** - v = √(2GM/r)
- **Day Length** - Based on rotation rate
- **Volume** - (4/3)πr³
- **Density Check** - Verify mass/volume matches density

#### Presets to Include

- Earth-like (5.972e24 kg, 6371 km, etc.)
- Mars-like (smaller, less dense)
- Jupiter-like (gas giant)
- Moon-like (small, rocky)
- Custom (user defined)

### 2. Compositional Parameters

#### Atmosphere System

| Parameter | Type | Unit | Range | Description |
|-----------|------|------|-------|-------------|
| composition | object | % | 0-100 each | Gas percentages (N₂, O₂, CO₂, Ar, etc.) |
| pressure | number | atm | 0 - 100 | Surface atmospheric pressure |
| thickness | number | km | 0 - 1000 | Height of atmosphere |
| greenhouseEffect | number | °C | 0 - 500 | Temperature increase from greenhouse gases |

**Composition object structure:**
```javascript
{
  N2: 78,    // Nitrogen
  O2: 21,    // Oxygen
  Ar: 0.93,  // Argon
  CO2: 0.04, // Carbon dioxide
  other: 0.03
}
```

**Important:** All composition percentages must sum to 100%.

**Atmospheric Retention Logic:**
- If escape velocity < 6 * thermal velocity of gas → atmosphere escapes
- Lighter gases (H₂, He) escape more easily from smaller planets

#### Water System

| Parameter | Type | Unit | Range | Description |
|-----------|------|------|-------|-------------|
| coverage | number | % | 0 - 100 | Surface covered by water |
| depth | number | km | 0 - 100 | Average ocean depth |
| salinity | number | g/L | 0 - 400 | Salt concentration |
| iceCaps | number | % | 0 - 100 | Percentage of water frozen at poles |

**Effects:**
- Water increases albedo (reflectivity)
- Ice caps reflect more light than liquid water
- Water moderates temperature (high heat capacity)

#### Surface System

| Parameter | Type | Unit | Range | Description |
|-----------|------|------|-------|-------------|
| composition | string | enum | - | Rock type (Basalt, Granite, Ice, Gas) |
| albedo | number | 0-1 | 0 - 1 | Surface reflectivity |
| temperature | number | K | 0 - 1000 | Average surface temperature |

**Albedo values:**
- Fresh snow: 0.8-0.9
- Ice: 0.5-0.7
- Ocean: 0.06
- Forest: 0.15
- Desert: 0.3

### 3. Advanced Parameters

#### Volcanic Activity

| Parameter | Type | Unit | Range | Description |
|-----------|------|------|-------|-------------|
| activityLevel | string | enum | - | None, Low, Moderate, High, Extreme |
| volcanoCount | number | count | 0 - 1000 | Number of active volcanoes |
| eruptionFrequency | number | years | 0 - 1000 | Average time between eruptions |
| lavaComposition | string | enum | - | Basaltic, Andesitic, Rhyolitic |
| gasEmissions | object | kg/s | - | SO₂, CO₂, H₂O emission rates |

**Effects on other systems:**
- Volcanic gases add to atmosphere over time
- Temperature increases near volcanic regions
- Surface composition changes
- Can create new landmasses

#### Magnetic Field

| Parameter | Type | Unit | Range | Description |
|-----------|------|------|-------|-------------|
| fieldStrength | number | μT | 0 - 1000 | Magnetic field intensity |
| dynamoActive | boolean | - | true/false | Whether core generates field |
| poleAlignment | number | degrees | 0 - 180 | Magnetic vs rotational pole offset |
| fieldShape | string | enum | - | Dipole, Quadrupole, Irregular |

**Requirements:**
- Needs molten metallic core (dynamo effect)
- Requires sufficient rotation rate
- Protects atmosphere from solar wind

**Effects:**
- Strong field → Aurora near poles
- Protects atmosphere from being stripped
- Affects charged particles

#### Plate Tectonics

| Parameter | Type | Unit | Range | Description |
|-----------|------|------|-------|-------------|
| tectonicActivity | string | enum | - | Active, Inactive, Stagnant Lid |
| plateCount | number | count | 0 - 50 | Number of major tectonic plates |
| movementRate | number | cm/year | 0 - 50 | Average plate velocity |
| mountainBuilding | boolean | - | true/false | Active orogeny |

**Effects:**
- Creates mountains, valleys, trenches
- Causes earthquakes
- Recycles crust
- Influences volcanism at plate boundaries

## Development Phases

### Phase 1: Foundation (Start Here)

**Goal:** Basic infrastructure and one working parameter system

1. **Project Setup**
   - Initialize npm project with Vite
   - Create folder structure
   - Set up basic HTML page with canvas
   - Install Three.js

2. **Basic Three.js Scene**
   - Create PlanetRenderer class
   - Simple sphere with basic material
   - Camera and lighting
   - OrbitControls for rotation

3. **Physical Parameters System**
   - Create PhysicalParameters class
   - Implement mass, radius, density
   - Calculate gravity and escape velocity
   - Add validation

4. **Simple UI**
   - Use dat.GUI for quick parameter controls
   - Connect sliders to planet parameters
   - Display calculated values

**Success Criteria:** User can adjust mass/radius, see planet size change, see calculated gravity

### Phase 2: Visual Enhancement

**Goal:** Make the planet look realistic

1. **Textures and Materials**
   - Add planet surface textures
   - Implement bump/normal maps
   - Add specular highlights for water
   - Create day/night shader

2. **Atmosphere Rendering**
   - Atmospheric glow shader
   - Atmospheric scattering (Rayleigh/Mie)
   - Transparency effects

3. **Lighting System**
   - Add sun/star light source
   - Shadows on planet
   - Ambient lighting

**Success Criteria:** Planet looks beautiful and realistic, with atmosphere and proper lighting

### Phase 3: Compositional Parameters

**Goal:** Add atmosphere and water systems

1. **Atmosphere System**
   - CompositionParameters class
   - Gas composition management
   - Pressure and thickness
   - Greenhouse effect calculation

2. **Water System**
   - Ocean rendering (specular water material)
   - Ice cap visualization
   - Water coverage affects texture

3. **Visual Updates**
   - Atmosphere color based on composition
   - Cloud layer rendering
   - Ice caps at poles

**Success Criteria:** User can change atmosphere composition, see color changes, add/remove water

### Phase 4: Advanced Features

**Goal:** Add geological and magnetic features

1. **Volcanic System**
   - Volcano placement on surface
   - Particle effects for eruptions
   - Lava flow visualization
   - Atmosphere composition changes over time

2. **Magnetic Field**
   - Magnetic field line visualization
   - Aurora effects near poles
   - Field strength affects aurora intensity

3. **Plate Tectonics**
   - Plate boundary visualization
   - Mountain/trench generation
   - Dynamic surface changes

**Success Criteria:** All advanced parameters work and have visual effects

### Phase 5: Polish and Features

1. **Better UI**
   - Custom UI (replace dat.GUI)
   - Organized parameter tabs
   - Presets system
   - Save/load functionality

2. **Animation System**
   - Time-lapse mode
   - Evolution simulation
   - Rotation animation

3. **Performance Optimization**
   - Web Workers for physics
   - Level of detail
   - Efficient rendering

4. **Documentation and Examples**
   - Tutorial mode
   - Example planets
   - Help tooltips

## Implementation Guidelines

### Code Style

```javascript
// Use ES6 classes
class PhysicalParameters {
  constructor(params) {
    this.mass = params.mass;
    this.radius = params.radius;
  }

  calculateGravity() {
    // Implementation
  }
}

// Use JSDoc for documentation
/**
 * Calculates surface gravity
 * @param {number} mass - Planet mass in kg
 * @param {number} radius - Planet radius in km
 * @returns {number} Surface gravity in m/s²
 */
function calculateSurfaceGravity(mass, radius) {
  // Implementation
}

// Use modules
export default PhysicalParameters;
export { calculateSurfaceGravity };
```

### File Naming

- Classes: PascalCase (e.g., `PhysicalParameters.js`)
- Utilities: camelCase (e.g., `calculateGravity.js`)
- Constants: UPPER_SNAKE_CASE (e.g., `GRAVITATIONAL_CONSTANT`)

### Testing

- Write tests for physics calculations (they must be accurate!)
- Test parameter validation
- Test edge cases (zero values, extreme values)
- Mock Three.js for rendering tests

### Physics Accuracy

- Use real physical constants
- Reference NASA data for validation
- Include sources in comments
- Test against known planets (Earth, Mars, etc.)

## Constants to Use

```javascript
// src/utils/Constants.js
export const GRAVITATIONAL_CONSTANT = 6.674e-11; // m³/(kg·s²)
export const BOLTZMANN_CONSTANT = 1.380649e-23; // J/K
export const STEFAN_BOLTZMANN = 5.670374419e-8; // W/(m²·K⁴)

// Gas molecular weights (kg/mol)
export const MOLECULAR_WEIGHTS = {
  H2: 0.002016,
  He: 0.004003,
  N2: 0.028014,
  O2: 0.031998,
  CO2: 0.04401,
  Ar: 0.039948
};

// Known planets for reference
export const EARTH = {
  mass: 5.972e24,      // kg
  radius: 6371,        // km
  density: 5515,       // kg/m³
  gravity: 9.81,       // m/s²
  rotationRate: 24,    // hours
  axialTilt: 23.5,     // degrees
};
```

## Common Pitfalls to Avoid

1. **Unit Inconsistency** - Always convert units properly (km to m, etc.)
2. **Forgetting Validation** - Always validate user input ranges
3. **Performance Issues** - Don't recalculate everything on every frame
4. **Magic Numbers** - Use named constants
5. **Coupling** - Keep physics, rendering, and UI separate
6. **Ignoring Edge Cases** - What happens with zero mass? No atmosphere?

## Testing Guidelines

### Must Test

- All physics calculations with known planet values
- Parameter validation (reject invalid inputs)
- Derived property calculations
- Unit conversions

### Example Test Structure

```javascript
describe('PhysicalParameters', () => {
  it('should match Earth values', () => {
    const earth = new PhysicalParameters(EARTH);
    expect(earth.calculateSurfaceGravity()).toBeCloseTo(9.81, 2);
    expect(earth.calculateEscapeVelocity()).toBeCloseTo(11.2, 1);
  });

  it('should reject negative mass', () => {
    expect(() => {
      new PhysicalParameters({ mass: -1000, radius: 6371 });
    }).toThrow();
  });
});
```

## Resources for Development

### Scientific References

- NASA Planetary Fact Sheets: https://nssdc.gsfc.nasa.gov/planetary/factsheet/
- Wolfram Alpha for calculations: https://www.wolframalpha.com/
- Wikipedia articles on specific topics (atmospheric composition, etc.)

### Three.js Resources

- Three.js Documentation: https://threejs.org/docs/
- Three.js Examples: https://threejs.org/examples/
- Shader tutorials for atmosphere effects

### Texture Sources

- Solar System Scope: https://www.solarsystemscope.com/textures/
- NASA Visible Earth: https://visibleearth.nasa.gov/
- Create procedural textures with noise functions

## Current Status

### Completed
- ✅ README.md with project overview
- ✅ DEV.md with technical documentation
- ✅ Repository structure defined
- ✅ Parameter systems specified

### Next Steps
1. Initialize npm project with Vite
2. Set up basic HTML + Three.js scene
3. Create PhysicalParameters class
4. Implement basic planet rendering
5. Add simple UI controls

## Notes for AI Assistants

- **Always read this file first** when helping with the project
- **Reference DEV.md** for detailed technical specifications
- **Follow the development phases** - don't skip ahead
- **Prioritize physics accuracy** - this is educational software
- **Keep it modular** - each system should work independently
- **Test calculations** against known planets
- **Use descriptive variable names** - readability matters
- **Comment complex calculations** - explain the physics
- **Ask questions** if requirements are unclear

## User Preferences

- **Language:** JavaScript only, no TypeScript
- **Framework:** Vanilla JS initially, can add framework later if needed
- **Build Tool:** Vite (fast and modern)
- **Style:** Clean, well-documented, modular code
- **Testing:** Yes, especially for physics calculations
- **Comments:** Generous comments explaining physics and formulas

## Future Possibilities

- Add more celestial bodies (moons, rings)
- Orbital mechanics simulation
- Life/habitability calculator
- Climate zones based on latitude
- Asteroid impact simulator
- Compare multiple planets side-by-side
- Export planet data as JSON
- VR support for immersive exploration
- Multiplayer planet building

---

**Last Updated:** 2025-11-17

**Version:** 1.0

This document should be updated as the project evolves and new requirements emerge.
