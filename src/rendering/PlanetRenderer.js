import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import PlanetTextureLoader from '../utils/TextureLoader.js';
import { createAtmosphereMaterial } from './AtmosphereShader.js';

/**
 * PlanetRenderer handles all Three.js rendering for the planet simulation
 */
class PlanetRenderer {
  /**
   * Creates a new PlanetRenderer instance
   * @param {string} containerId - The ID of the DOM element to attach the renderer to
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.planetMesh = null;
    this.atmosphereMesh = null;
    this.cloudMesh = null;
    this.animationId = null;
    this.textureLoader = new PlanetTextureLoader();

    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupControls();
    this.setupStarfield();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Sets up the camera
   */
  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(10, 5, 15);
  }

  /**
   * Sets up the WebGL renderer
   */
  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Sets up scene lighting with improved realism
   */
  setupLights() {
    // Ambient light for overall subtle illumination
    const ambientLight = new THREE.AmbientLight(0x222244, 0.4);
    this.scene.add(ambientLight);

    // Main sun light (directional)
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.sunLight.position.set(10, 5, 7);
    this.sunLight.castShadow = true;

    // Configure shadow properties for better quality
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 500;

    this.scene.add(this.sunLight);

    // Add a subtle rim light for the dark side
    const rimLight = new THREE.PointLight(0x4466ff, 0.3);
    rimLight.position.set(-10, 0, -10);
    this.scene.add(rimLight);

    // Optional: Add a visual sun sphere
    const sunGeometry = new THREE.SphereGeometry(1, 16, 16);
    const sunMaterial = new THREE.MeshBasicMaterial({
      color: 0xffff88,
      emissive: 0xffff88
    });
    this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    this.sunMesh.position.copy(this.sunLight.position).multiplyScalar(3);
    this.scene.add(this.sunMesh);
  }

  /**
   * Creates a starfield background
   */
  setupStarfield() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      sizeAttenuation: true
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(starField);
  }

  /**
   * Sets up orbit controls for camera manipulation
   */
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 7;
    this.controls.maxDistance = 50;
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 0.5;
  }

  /**
   * Creates a planet mesh with enhanced visuals
   * @param {Object} params - Planet physical parameters
   * @param {Object} composition - Planet composition parameters (optional)
   * @returns {THREE.Mesh} The planet mesh
   */
  createPlanetMesh(params, composition = null) {
    // Remove existing meshes if any
    if (this.planetMesh) {
      this.scene.remove(this.planetMesh);
      this.planetMesh.geometry.dispose();
      this.planetMesh.material.dispose();
    }

    if (this.atmosphereMesh) {
      this.scene.remove(this.atmosphereMesh);
      this.atmosphereMesh.geometry.dispose();
      this.atmosphereMesh.material.dispose();
    }

    if (this.cloudMesh) {
      this.scene.remove(this.cloudMesh);
      this.cloudMesh.geometry.dispose();
      this.cloudMesh.material.dispose();
    }

    // Scale the radius for better visualization
    const displayRadius = params.radius / 1000;

    // Get composition parameters if available
    const textureOptions = composition ? {
      waterCoverage: composition.water.coverage,
      temperature: composition.surface.temperature,
      iceCaps: composition.water.iceCaps
    } : {};

    // Create textures with composition
    const textures = this.textureLoader.createPlanetTextures(textureOptions);

    // Create planet geometry
    const geometry = new THREE.SphereGeometry(displayRadius, 64, 64);

    // Create planet material with textures
    const material = new THREE.MeshPhongMaterial({
      map: textures.map,
      bumpMap: textures.bumpMap,
      bumpScale: 0.05,
      specularMap: textures.specularMap,
      specular: new THREE.Color(0x333333),
      shininess: 10
    });

    this.planetMesh = new THREE.Mesh(geometry, material);
    this.planetMesh.castShadow = true;
    this.planetMesh.receiveShadow = true;
    this.scene.add(this.planetMesh);

    // Create atmosphere with composition-based color
    const atmosphereColor = composition ? composition.getAtmosphereColor() : [0.3, 0.6, 1.0];
    this.createAtmosphere(displayRadius, atmosphereColor);

    // Create cloud layer (only if atmosphere has enough pressure)
    const hasAtmosphere = !composition || composition.atmosphere.pressure > 0.1;
    if (hasAtmosphere) {
      this.createCloudLayer(displayRadius, textures.cloudMap);
    }

    return this.planetMesh;
  }

  /**
   * Creates an atmospheric glow around the planet
   * @param {number} radius - Planet radius
   * @param {Array<number>} color - RGB color array [r, g, b] (0-1 range)
   */
  createAtmosphere(radius, color = [0.3, 0.6, 1.0]) {
    const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.15, 64, 64);

    const atmosphereMaterialParams = createAtmosphereMaterial({
      glowColor: color,
      coefficient: 0.1,
      power: 4.0
    });

    const atmosphereMaterial = new THREE.ShaderMaterial(atmosphereMaterialParams);

    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    this.scene.add(this.atmosphereMesh);
  }

  /**
   * Creates a cloud layer above the planet
   * @param {number} radius - Planet radius
   * @param {THREE.Texture} cloudTexture - Cloud texture
   */
  createCloudLayer(radius, cloudTexture) {
    const cloudGeometry = new THREE.SphereGeometry(radius * 1.01, 64, 64);
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false
    });

    this.cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    this.scene.add(this.cloudMesh);
  }

  /**
   * Updates the planet's size based on new radius parameter
   * @param {number} radius - New radius in kilometers
   */
  updatePlanetSize(radius) {
    if (!this.planetMesh) return;

    const displayRadius = radius / 1000;

    // Update planet
    this.planetMesh.geometry.dispose();
    this.planetMesh.geometry = new THREE.SphereGeometry(displayRadius, 64, 64);

    // Update atmosphere
    if (this.atmosphereMesh) {
      this.atmosphereMesh.geometry.dispose();
      this.atmosphereMesh.geometry = new THREE.SphereGeometry(displayRadius * 1.15, 64, 64);
    }

    // Update clouds
    if (this.cloudMesh) {
      this.cloudMesh.geometry.dispose();
      this.cloudMesh.geometry = new THREE.SphereGeometry(displayRadius * 1.01, 64, 64);
    }
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Rotate planet
    if (this.planetMesh) {
      this.planetMesh.rotation.y += 0.0005;
    }

    // Rotate clouds slightly faster for realism
    if (this.cloudMesh) {
      this.cloudMesh.rotation.y += 0.0007;
    }

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Starts the animation loop
   */
  start() {
    if (!this.animationId) {
      this.animate();
    }
  }

  /**
   * Stops the animation loop
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Handles window resize events
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  /**
   * Cleans up resources
   */
  dispose() {
    this.stop();

    if (this.planetMesh) {
      this.planetMesh.geometry.dispose();
      this.planetMesh.material.dispose();
    }

    if (this.atmosphereMesh) {
      this.atmosphereMesh.geometry.dispose();
      this.atmosphereMesh.material.dispose();
    }

    if (this.cloudMesh) {
      this.cloudMesh.geometry.dispose();
      this.cloudMesh.material.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.controls) {
      this.controls.dispose();
    }

    window.removeEventListener('resize', () => this.onWindowResize());
  }
}

export default PlanetRenderer;
