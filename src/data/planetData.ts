export interface PlanetData {
  name: string;
  radius: number; // visual radius in scene
  orbitRadius: number; // distance from sun in scene
  orbitSpeed: number; // radians per second
  rotationSpeed: number;
  color: string;
  textureUrl: string;
  tilt: number; // axial tilt in degrees
  hasRings?: boolean;
  ringColor?: string;
  info: {
    distanceFromSun: string;
    gravity: string;
    diameter: string;
    dayLength: string;
    yearLength: string;
    moons: number;
    atmosphere: string[];
    temperature: string;
    type: string;
    distanceFromPrevious: string;
    distanceFromNext: string;
  };
}

export const SUN_DATA = {
  name: "Sun",
  radius: 3,
  color: "#FDB813",
  textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/1280px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg",
  info: {
    type: "G-type main-sequence star (Yellow Dwarf)",
    diameter: "1,391,000 km",
    temperature: "5,500°C (surface) / 15 million°C (core)",
    gravity: "274 m/s² (28× Earth)",
    composition: ["Hydrogen (73%)", "Helium (25%)", "Oxygen, Carbon, Neon, Iron (2%)"],
    age: "4.6 billion years",
    mass: "1.989 × 10³⁰ kg (333,000× Earth)",
    luminosity: "3.828 × 10²⁶ watts",
  },
};

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    radius: 0.35,
    orbitRadius: 6,
    orbitSpeed: 0.8,
    rotationSpeed: 0.5,
    color: "#A0896E",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Mercury_in_true_color.jpg/1280px-Mercury_in_true_color.jpg",
    tilt: 0.03,
    info: {
      distanceFromSun: "57.9 million km (0.39 AU)",
      gravity: "3.7 m/s² (0.38× Earth)",
      diameter: "4,879 km",
      dayLength: "58.6 Earth days",
      yearLength: "88 Earth days",
      moons: 0,
      atmosphere: ["Almost none", "Traces of oxygen, sodium, hydrogen"],
      temperature: "-180°C to 430°C",
      type: "Terrestrial (Rocky)",
      distanceFromPrevious: "— (closest to Sun)",
      distanceFromNext: "50.3 million km to Venus",
    },
  },
  {
    name: "Venus",
    radius: 0.6,
    orbitRadius: 9,
    orbitSpeed: 0.6,
    rotationSpeed: -0.2,
    color: "#E8CDA0",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg",
    tilt: 177.4,
    info: {
      distanceFromSun: "108.2 million km (0.72 AU)",
      gravity: "8.87 m/s² (0.9× Earth)",
      diameter: "12,104 km",
      dayLength: "243 Earth days (retrograde)",
      yearLength: "225 Earth days",
      moons: 0,
      atmosphere: ["Carbon dioxide (96.5%)", "Nitrogen (3.5%)", "Sulfuric acid clouds"],
      temperature: "462°C (hottest planet)",
      type: "Terrestrial (Rocky)",
      distanceFromPrevious: "50.3 million km from Mercury",
      distanceFromNext: "41.4 million km to Earth",
    },
  },
  {
    name: "Earth",
    radius: 0.65,
    orbitRadius: 12,
    orbitSpeed: 0.5,
    rotationSpeed: 1.5,
    color: "#4B8BBE",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/The_Blue_Marble_%28remastered%29.jpg/1280px-The_Blue_Marble_%28remastered%29.jpg",
    tilt: 23.44,
    info: {
      distanceFromSun: "149.6 million km (1 AU)",
      gravity: "9.81 m/s² (1× Earth)",
      diameter: "12,742 km",
      dayLength: "24 hours",
      yearLength: "365.25 days",
      moons: 1,
      atmosphere: ["Nitrogen (78%)", "Oxygen (21%)", "Argon (0.93%)", "CO₂ (0.04%)"],
      temperature: "-89°C to 57°C (avg 15°C)",
      type: "Terrestrial (Rocky)",
      distanceFromPrevious: "41.4 million km from Venus",
      distanceFromNext: "78.3 million km to Mars",
    },
  },
  {
    name: "Mars",
    radius: 0.45,
    orbitRadius: 16,
    orbitSpeed: 0.4,
    rotationSpeed: 1.4,
    color: "#C1440E",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1280px-OSIRIS_Mars_true_color.jpg",
    tilt: 25.19,
    info: {
      distanceFromSun: "227.9 million km (1.52 AU)",
      gravity: "3.72 m/s² (0.38× Earth)",
      diameter: "6,779 km",
      dayLength: "24.6 hours",
      yearLength: "687 Earth days",
      moons: 2,
      atmosphere: ["Carbon dioxide (95.3%)", "Nitrogen (2.7%)", "Argon (1.6%)"],
      temperature: "-140°C to 20°C",
      type: "Terrestrial (Rocky)",
      distanceFromPrevious: "78.3 million km from Earth",
      distanceFromNext: "550.4 million km to Jupiter",
    },
  },
  {
    name: "Jupiter",
    radius: 1.8,
    orbitRadius: 22,
    orbitSpeed: 0.25,
    rotationSpeed: 3,
    color: "#C88B3A",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Jupiter_New_Horizons.jpg/1280px-Jupiter_New_Horizons.jpg",
    tilt: 3.13,
    info: {
      distanceFromSun: "778.3 million km (5.2 AU)",
      gravity: "24.79 m/s² (2.53× Earth)",
      diameter: "139,820 km",
      dayLength: "9.93 hours (fastest rotation)",
      yearLength: "11.86 Earth years",
      moons: 95,
      atmosphere: ["Hydrogen (89.8%)", "Helium (10.2%)", "Methane, ammonia traces"],
      temperature: "-110°C (cloud tops)",
      type: "Gas Giant",
      distanceFromPrevious: "550.4 million km from Mars",
      distanceFromNext: "649.1 million km to Saturn",
    },
  },
  {
    name: "Saturn",
    radius: 1.5,
    orbitRadius: 28,
    orbitSpeed: 0.18,
    rotationSpeed: 2.8,
    color: "#E8D5A3",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Saturn_during_Equinox.jpg/1280px-Saturn_during_Equinox.jpg",
    tilt: 26.73,
    hasRings: true,
    ringColor: "#D4C494",
    info: {
      distanceFromSun: "1.427 billion km (9.54 AU)",
      gravity: "10.44 m/s² (1.06× Earth)",
      diameter: "116,460 km",
      dayLength: "10.7 hours",
      yearLength: "29.46 Earth years",
      moons: 146,
      atmosphere: ["Hydrogen (96.3%)", "Helium (3.25%)", "Methane, ammonia traces"],
      temperature: "-140°C (cloud tops)",
      type: "Gas Giant",
      distanceFromPrevious: "649.1 million km from Jupiter",
      distanceFromNext: "1.443 billion km to Uranus",
    },
  },
  {
    name: "Uranus",
    radius: 1.0,
    orbitRadius: 34,
    orbitSpeed: 0.12,
    rotationSpeed: -1.5,
    color: "#7EC8E3",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Uranus2.jpg/1280px-Uranus2.jpg",
    tilt: 97.77,
    hasRings: true,
    ringColor: "#5A8A9A",
    info: {
      distanceFromSun: "2.871 billion km (19.2 AU)",
      gravity: "8.69 m/s² (0.89× Earth)",
      diameter: "50,724 km",
      dayLength: "17.2 hours (retrograde)",
      yearLength: "84 Earth years",
      moons: 28,
      atmosphere: ["Hydrogen (82.5%)", "Helium (15.2%)", "Methane (2.3%)"],
      temperature: "-224°C",
      type: "Ice Giant",
      distanceFromPrevious: "1.443 billion km from Saturn",
      distanceFromNext: "1.627 billion km to Neptune",
    },
  },
  {
    name: "Neptune",
    radius: 0.95,
    orbitRadius: 40,
    orbitSpeed: 0.08,
    rotationSpeed: 1.6,
    color: "#4166F5",
    textureUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg/1280px-Neptune_-_Voyager_2_%2829347980845%29_flatten_crop.jpg",
    tilt: 28.32,
    info: {
      distanceFromSun: "4.498 billion km (30.06 AU)",
      gravity: "11.15 m/s² (1.14× Earth)",
      diameter: "49,528 km",
      dayLength: "16.1 hours",
      yearLength: "164.8 Earth years",
      moons: 16,
      atmosphere: ["Hydrogen (80%)", "Helium (19%)", "Methane (1%)"],
      temperature: "-214°C",
      type: "Ice Giant",
      distanceFromPrevious: "1.627 billion km from Uranus",
      distanceFromNext: "— (outermost planet)",
    },
  },
];
