import * as THREE from 'three';

/**
 * TextureLoader utility for loading and creating planet textures
 */
class PlanetTextureLoader {
  constructor() {
    this.loader = new THREE.TextureLoader();
    this.cache = new Map();
  }

  /**
   * Load a texture from a URL with caching
   * @param {string} url - URL to the texture
   * @returns {Promise<THREE.Texture>} Loaded texture
   */
  async loadTexture(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (texture) => {
          this.cache.set(url, texture);
          resolve(texture);
        },
        undefined,
        (error) => {
          console.error(`Error loading texture ${url}:`, error);
          reject(error);
        }
      );
    });
  }

  /**
   * Create a procedural Earth-like texture
   * @returns {THREE.Texture} Generated texture
   */
  createEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Create a gradient for ocean and land
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);

    // Ocean blue base
    ctx.fillStyle = '#1a4d7a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some land masses (simplified continents)
    ctx.fillStyle = '#2d5a2f';

    // Add random land patches
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 20 + Math.random() * 80;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add polar ice caps
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, 30);
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  /**
   * Create a procedural bump map for terrain
   * @returns {THREE.Texture} Generated bump map
   */
  createBumpMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    // Base gray
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add noise for terrain variation
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 60 - 30;
      data[i] = Math.max(0, Math.min(255, 128 + noise));
      data[i + 1] = Math.max(0, Math.min(255, 128 + noise));
      data[i + 2] = Math.max(0, Math.min(255, 128 + noise));
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  /**
   * Create a specular map for water reflection
   * @returns {THREE.Texture} Generated specular map
   */
  createSpecularMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Black base (no reflection for land)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // White for oceans (high reflection)
    ctx.fillStyle = '#ffffff';

    // Simplified ocean areas (opposite of land)
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 30 + Math.random() * 100;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  /**
   * Create a cloud texture
   * @returns {THREE.Texture} Generated cloud texture
   */
  createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Transparent base
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add white clouds with varying opacity
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    for (let i = 0; i < 60; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = 20 + Math.random() * 60;
      const opacity = 0.3 + Math.random() * 0.5;

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    return texture;
  }

  /**
   * Create all textures needed for a planet
   * @returns {Object} Object containing all textures
   */
  createPlanetTextures() {
    return {
      map: this.createEarthTexture(),
      bumpMap: this.createBumpMap(),
      specularMap: this.createSpecularMap(),
      cloudMap: this.createCloudTexture()
    };
  }
}

export default PlanetTextureLoader;
