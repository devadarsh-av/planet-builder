import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
    this.animationId = null;

    this.setupCamera();
    this.setupRenderer();
    this.setupLights();
    this.setupControls();

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  /**
   * Sets up the camera
   */
  setupCamera() {
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.z = 15;
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
    this.renderer.setClearColor(0x000011, 1); // Dark blue space background
    this.container.appendChild(this.renderer.domElement);
  }

  /**
   * Sets up scene lighting
   */
  setupLights() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    // Directional light to simulate sunlight
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(5, 3, 5);
    this.scene.add(sunLight);

    // Add a point light for additional highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-5, -3, -5);
    this.scene.add(pointLight);
  }

  /**
   * Sets up orbit controls for camera manipulation
   */
  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 50;
  }

  /**
   * Creates a planet mesh with the given parameters
   * @param {Object} params - Planet physical parameters
   * @returns {THREE.Mesh} The planet mesh
   */
  createPlanetMesh(params) {
    // Remove existing planet if any
    if (this.planetMesh) {
      this.scene.remove(this.planetMesh);
      this.planetMesh.geometry.dispose();
      this.planetMesh.material.dispose();
    }

    // Scale the radius for better visualization (divide by 1000 to keep it reasonable)
    const displayRadius = params.radius / 1000;

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(displayRadius, 64, 64);

    // Create material with basic Earth-like appearance
    const material = new THREE.MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      specular: 0x333333,
      shininess: 25,
      flatShading: false
    });

    this.planetMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.planetMesh);

    return this.planetMesh;
  }

  /**
   * Updates the planet's size based on new radius parameter
   * @param {number} radius - New radius in kilometers
   */
  updatePlanetSize(radius) {
    if (!this.planetMesh) return;

    const displayRadius = radius / 1000;
    this.planetMesh.geometry.dispose();
    this.planetMesh.geometry = new THREE.SphereGeometry(displayRadius, 64, 64);
  }

  /**
   * Animation loop
   */
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());

    // Rotate planet slowly
    if (this.planetMesh) {
      this.planetMesh.rotation.y += 0.001;
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
