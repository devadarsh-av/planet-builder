import './style.css';
import PhysicalParameters from './parameters/PhysicalParams.js';
import CompositionParameters, { EARTH_COMPOSITION, MARS_COMPOSITION, VENUS_COMPOSITION } from './parameters/CompositionParams.js';
import PlanetRenderer from './rendering/PlanetRenderer.js';
import { EARTH, MARS, JUPITER, MOON } from './utils/Constants.js';
import * as dat from 'dat.gui';

/**
 * Main application class
 */
class PlanetBuilderApp {
  constructor() {
    this.renderer = null;
    this.parameters = null;
    this.composition = null;
    this.gui = null;
    this.guiControls = null;

    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    // Create default planet with Earth-like parameters
    this.parameters = new PhysicalParameters(EARTH);
    this.composition = new CompositionParameters(EARTH_COMPOSITION);

    // Initialize the renderer
    this.renderer = new PlanetRenderer('app');

    // Create the planet mesh with composition
    this.renderer.createPlanetMesh(this.parameters, this.composition);

    // Set up GUI controls
    this.setupGUI();

    // Start the animation loop
    this.renderer.start();

    // Display initial calculated values
    this.updateCalculatedValues();

    console.log('Planet Builder initialized!');
    console.log(this.parameters.toString());
    console.log(this.composition.toString());
  }

  /**
   * Set up dat.GUI controls
   */
  setupGUI() {
    this.gui = new dat.GUI({ width: 300 });

    // Create a controls object for dat.GUI
    this.guiControls = {
      mass: this.parameters.mass,
      radius: this.parameters.radius,
      density: this.parameters.density,
      rotationRate: this.parameters.rotationRate,
      axialTilt: this.parameters.axialTilt,
      // Calculated values (read-only display)
      surfaceGravity: 0,
      escapeVelocity: 0,
      // Composition parameters
      waterCoverage: this.composition.water.coverage,
      temperature: this.composition.surface.temperature,
      iceCaps: this.composition.water.iceCaps,
      atmospherePressure: this.composition.atmosphere.pressure,
      CO2: this.composition.atmosphere.composition.CO2 || 0.04,
      // Calculated composition values
      effectiveTemp: 0,
      // Preset selection
      preset: 'Earth'
    };

    // Physical Parameters folder
    const physicsFolder = this.gui.addFolder('Physical Parameters');

    physicsFolder.add(this.guiControls, 'mass', 1e20, 1e30)
      .name('Mass (kg)')
      .onChange((value) => this.onParameterChange('mass', value));

    physicsFolder.add(this.guiControls, 'radius', 100, 100000)
      .name('Radius (km)')
      .onChange((value) => this.onParameterChange('radius', value));

    physicsFolder.add(this.guiControls, 'density', 500, 15000)
      .name('Density (kg/m³)')
      .onChange((value) => this.onParameterChange('density', value));

    physicsFolder.add(this.guiControls, 'rotationRate', 0.1, 1000)
      .name('Rotation (hours)')
      .onChange((value) => this.onParameterChange('rotationRate', value));

    physicsFolder.add(this.guiControls, 'axialTilt', 0, 180)
      .name('Axial Tilt (°)')
      .onChange((value) => this.onParameterChange('axialTilt', value));

    physicsFolder.open();

    // Composition Parameters folder
    const compositionFolder = this.gui.addFolder('Composition Parameters');

    compositionFolder.add(this.guiControls, 'waterCoverage', 0, 100)
      .name('Water Coverage (%)')
      .onChange((value) => this.onCompositionChange('waterCoverage', value));

    compositionFolder.add(this.guiControls, 'temperature', 100, 800)
      .name('Temperature (K)')
      .onChange((value) => this.onCompositionChange('temperature', value));

    compositionFolder.add(this.guiControls, 'iceCaps', 0, 100)
      .name('Ice Caps (%)')
      .onChange((value) => this.onCompositionChange('iceCaps', value));

    compositionFolder.add(this.guiControls, 'atmospherePressure', 0, 10)
      .name('Pressure (atm)')
      .onChange((value) => this.onCompositionChange('atmospherePressure', value));

    compositionFolder.add(this.guiControls, 'CO2', 0, 100)
      .name('CO2 (%)')
      .onChange((value) => this.onCompositionChange('CO2', value));

    compositionFolder.open();

    // Calculated Values folder (read-only)
    const calculatedFolder = this.gui.addFolder('Calculated Properties');

    calculatedFolder.add(this.guiControls, 'surfaceGravity')
      .name('Gravity (m/s²)')
      .listen();

    calculatedFolder.add(this.guiControls, 'escapeVelocity')
      .name('Escape Vel (km/s)')
      .listen();

    calculatedFolder.add(this.guiControls, 'effectiveTemp')
      .name('Effective Temp (K)')
      .listen();

    calculatedFolder.open();

    // Presets folder
    const presetsFolder = this.gui.addFolder('Presets');

    presetsFolder.add(this.guiControls, 'preset', ['Earth', 'Mars', 'Jupiter', 'Moon'])
      .name('Load Preset')
      .onChange((value) => this.loadPreset(value));

    presetsFolder.open();
  }

  /**
   * Handle parameter changes from GUI
   * @param {string} param - Parameter name
   * @param {number} value - New value
   */
  onParameterChange(param, value) {
    try {
      // Update the parameter
      this.parameters[param] = value;

      // Update visual representation if radius changed
      if (param === 'radius') {
        this.renderer.updatePlanetSize(value);
      }

      // Update calculated values
      this.updateCalculatedValues();

    } catch (error) {
      console.error('Error updating parameter:', error);
    }
  }

  /**
   * Handle composition parameter changes from GUI
   * @param {string} param - Parameter name
   * @param {number} value - New value
   */
  onCompositionChange(param, value) {
    try {
      // Update the composition parameter
      if (param === 'waterCoverage') {
        this.composition.water.coverage = value;
      } else if (param === 'temperature') {
        this.composition.surface.temperature = value;
      } else if (param === 'iceCaps') {
        this.composition.water.iceCaps = value;
      } else if (param === 'atmospherePressure') {
        this.composition.atmosphere.pressure = value;
      } else if (param === 'CO2') {
        this.composition.atmosphere.composition.CO2 = value;
        // Adjust N2 to keep total at 100%
        const others = Object.entries(this.composition.atmosphere.composition)
          .filter(([gas]) => gas !== 'CO2' && gas !== 'N2')
          .reduce((sum, [, pct]) => sum + pct, 0);
        this.composition.atmosphere.composition.N2 = Math.max(0, 100 - value - others);
      }

      // Recreate the planet with new composition
      this.renderer.createPlanetMesh(this.parameters, this.composition);

      // Update calculated values
      this.updateCalculatedValues();

      console.log('Composition updated:', param, value);
    } catch (error) {
      console.error('Error updating composition:', error);
    }
  }

  /**
   * Update calculated values display
   */
  updateCalculatedValues() {
    const calculated = this.parameters.getCalculatedProperties();
    this.guiControls.surfaceGravity = parseFloat(calculated.surfaceGravity.toFixed(2));
    this.guiControls.escapeVelocity = parseFloat(calculated.escapeVelocity.toFixed(2));

    // Update composition calculated values
    if (this.composition) {
      this.guiControls.effectiveTemp = parseFloat(this.composition.getEffectiveTemperature().toFixed(1));
    }
  }

  /**
   * Load a preset planet configuration
   * @param {string} presetName - Name of the preset
   */
  loadPreset(presetName) {
    let physicalPreset;
    let compositionPreset;

    switch (presetName) {
      case 'Earth':
        physicalPreset = EARTH;
        compositionPreset = EARTH_COMPOSITION;
        break;
      case 'Mars':
        physicalPreset = MARS;
        compositionPreset = MARS_COMPOSITION;
        break;
      case 'Jupiter':
        physicalPreset = JUPITER;
        compositionPreset = EARTH_COMPOSITION; // Gas giant, use Earth as placeholder
        break;
      case 'Moon':
        physicalPreset = MOON;
        compositionPreset = MARS_COMPOSITION; // No atmosphere like Mars
        break;
      default:
        console.error('Unknown preset:', presetName);
        return;
    }

    // Update parameters
    this.parameters = new PhysicalParameters(physicalPreset);
    this.composition = new CompositionParameters(compositionPreset);

    // Update GUI controls - physical
    this.guiControls.mass = physicalPreset.mass;
    this.guiControls.radius = physicalPreset.radius;
    this.guiControls.density = physicalPreset.density;
    this.guiControls.rotationRate = physicalPreset.rotationRate;
    this.guiControls.axialTilt = physicalPreset.axialTilt;

    // Update GUI controls - composition
    this.guiControls.waterCoverage = this.composition.water.coverage;
    this.guiControls.temperature = this.composition.surface.temperature;
    this.guiControls.iceCaps = this.composition.water.iceCaps;
    this.guiControls.atmospherePressure = this.composition.atmosphere.pressure;
    this.guiControls.CO2 = this.composition.atmosphere.composition.CO2 || 0.04;

    // Recreate planet with new parameters
    this.renderer.createPlanetMesh(this.parameters, this.composition);

    // Update calculated values
    this.updateCalculatedValues();

    // Update all GUI controllers to reflect new values
    this.gui.updateDisplay();

    console.log(`Loaded ${presetName} preset`);
    console.log(this.parameters.toString());
    console.log(this.composition.toString());
  }
}

// Initialize the app when DOM is ready
console.log('main.js loaded');
console.log('Document ready state:', document.readyState);

try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOMContentLoaded fired');
      new PlanetBuilderApp();
    });
  } else {
    console.log('Document already loaded, initializing app');
    new PlanetBuilderApp();
  }
} catch (error) {
  console.error('Error initializing app:', error);
}
