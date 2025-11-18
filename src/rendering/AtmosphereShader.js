/**
 * Custom shaders for atmospheric glow effect
 * Based on atmospheric scattering principles
 */

export const atmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = `
  uniform vec3 glowColor;
  uniform float coefficient;
  uniform float power;

  varying vec3 vNormal;
  varying vec3 vPositionNormal;

  void main() {
    float intensity = pow(
      coefficient + dot(vNormal, vPositionNormal),
      power
    );

    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;

/**
 * Create atmosphere material with custom shaders
 * @param {Object} options - Atmosphere options
 * @returns {THREE.ShaderMaterial} Atmosphere material
 */
export function createAtmosphereMaterial(options = {}) {
  const {
    glowColor = [0.3, 0.6, 1.0], // Light blue
    coefficient = 0.5,
    power = 3.5
  } = options;

  return {
    uniforms: {
      glowColor: { value: glowColor },
      coefficient: { value: coefficient },
      power: { value: power }
    },
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    side: 1, // THREE.BackSide
    blending: 2, // THREE.AdditiveBlending
    transparent: true
  };
}
