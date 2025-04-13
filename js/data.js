const planetData = {
    sun: {
        name: "Sun",
        overview: "The Sun is the star at the center of the Solar System. It is a nearly perfect ball of hot plasma, heated to incandescence by nuclear fusion reactions in its core. The Sun radiates this energy mainly as light, ultraviolet, and infrared radiation, and is the most important source of energy for life on Earth.",
        physical: {
            diameter: "1,392,700 km (109 times Earth's diameter)",
            mass: "1.989 × 10^30 kg (333,000 times Earth's mass)",
            composition: "Hydrogen (73%), Helium (25%), Other elements (2%)",
            temperature: "Core: ~15,000,000°C, Surface: ~5,500°C",
            gravity: "274 m/s² (27.9 times Earth's gravity)"
        },
        orbit: {
            period: "The Sun orbits the center of the Milky Way Galaxy at a distance of about 26,000 light-years",
            speed: "220 km/s around the galactic center",
            rotation: "25-35 days (varies by latitude due to differential rotation)"
        },
        atmosphere: {
            composition: "The Sun's atmosphere consists of the photosphere (visible surface), chromosphere, transition region, and corona (outer atmosphere).",
            features: "Solar flares, coronal mass ejections, sunspots, solar wind"
        },
        texturePath: "Images/Sun.jpg"
    },
    mercury: {
        name: "Mercury",
        overview: "Mercury is the smallest and innermost planet in the Solar System. It has no natural satellites and no substantial atmosphere. Mercury has a large iron core that generates a magnetic field about 1% as strong as Earth's. It has a very thin exosphere containing hydrogen, helium, oxygen, sodium, calcium, potassium and water vapor.",
        physical: {
            diameter: "4,880 km (0.38 times Earth's diameter)",
            mass: "3.3011 × 10^23 kg (0.055 times Earth's mass)",
            composition: "Rock and metal, with a core that is approximately 61% of its volume",
            temperature: "Day: 430°C, Night: -180°C",
            gravity: "3.7 m/s² (0.38 times Earth's gravity)"
        },
        orbit: {
            distance: "57.9 million km from the Sun (0.39 AU)",
            period: "88 Earth days",
            speed: "47.4 km/s",
            rotation: "58.6 Earth days",
            tilt: "0.03 degrees"
        },
        atmosphere: {
            composition: "Extremely thin, composed mainly of oxygen, sodium, hydrogen, helium, and potassium",
            pressure: "Very low, about 10^-15 times Earth's atmospheric pressure"
        },
        texturePath: "Images/Mercury.jpg"
    },
    venus: {
        name: "Venus",
        overview: "Venus is the second planet from the Sun and is often called Earth's 'sister planet' due to their similar size and mass. It has the densest atmosphere of all terrestrial planets, consisting mostly of carbon dioxide. The atmospheric pressure at the planet's surface is about 92 times that of Earth's. Venus has no natural satellites and is the hottest planet in our solar system.",
        physical: {
            diameter: "12,104 km (0.95 times Earth's diameter)",
            mass: "4.8675 × 10^24 kg (0.815 times Earth's mass)",
            composition: "Rocky planet with a core, mantle, and crust similar to Earth",
            temperature: "Average: 462°C (hot enough to melt lead)",
            gravity: "8.87 m/s² (0.9 times Earth's gravity)"
        },
        orbit: {
            distance: "108.2 million km from the Sun (0.72 AU)",
            period: "225 Earth days",
            speed: "35 km/s",
            rotation: "243 Earth days (retrograde rotation)",
            tilt: "177.3 degrees (nearly upside-down)"
        },
        atmosphere: {
            composition: "96.5% carbon dioxide, 3.5% nitrogen, traces of sulfur dioxide",
            pressure: "92 times Earth's atmospheric pressure",
            features: "Thick cloud layers of sulfuric acid, super-rotation of atmosphere"
        },
        texturePath: "Images/Venus.jpg"
    },
    earth: {
        name: "Earth",
        overview: "Earth is the third planet from the Sun and the only astronomical object known to harbor life. About 71% of the Earth's surface is covered with water. Earth's atmosphere is composed of 78% nitrogen, 21% oxygen, with trace amounts of other gases including carbon dioxide. Earth's gravity interacts with other objects in space, especially the Moon, which is Earth's only natural satellite.",
        physical: {
            diameter: "12,742 km",
            mass: "5.97237 × 10^24 kg",
            composition: "Iron core, silicate mantle, and crust consisting mainly of silicate rocks",
            temperature: "Average: 15°C, Range: -89.2°C to 56.7°C",
            gravity: "9.8 m/s²"
        },
        orbit: {
            distance: "149.6 million km from the Sun (1 AU)",
            period: "365.25 days",
            speed: "29.78 km/s",
            rotation: "23 hours, 56 minutes, 4 seconds",
            tilt: "23.5 degrees"
        },
        atmosphere: {
            composition: "78% nitrogen, 21% oxygen, 1% argon, 0.04% carbon dioxide, water vapor",
            pressure: "101.3 kPa at sea level",
            features: "Ozone layer, weather systems, clouds, aurora borealis/australis"
        },
        texturePath: "Images/Earth.jpg"
    },
    mars: {
        name: "Mars",
        overview: "Mars is the fourth planet from the Sun and the second-smallest planet in the Solar System, being larger than only Mercury. Mars has a thin atmosphere and surface features reminiscent of the impact craters of the Moon and the valleys, deserts, and polar ice caps of Earth. Mars has two small moons, Phobos and Deimos.",
        physical: {
            diameter: "6,779 km (0.53 times Earth's diameter)",
            mass: "6.4171 × 10^23 kg (0.107 times Earth's mass)",
            composition: "Iron, nickel, and sulfur core, silicate mantle, crust rich in iron oxides",
            temperature: "Average: -63°C, Range: -143°C to 35°C",
            gravity: "3.71 m/s² (0.38 times Earth's gravity)"
        },
        orbit: {
            distance: "227.9 million km from the Sun (1.52 AU)",
            period: "687 Earth days",
            speed: "24.1 km/s",
            rotation: "24 hours, 37 minutes",
            tilt: "25.2 degrees"
        },
        atmosphere: {
            composition: "95.3% carbon dioxide, 2.7% nitrogen, 1.6% argon",
            pressure: "0.6 kPa (0.6% of Earth's atmospheric pressure)",
            features: "Dust storms that occasionally engulf the entire planet, thin clouds, polar caps"
        },
        texturePath: "Images/Mars.jpg"
    },
    jupiter: {
        name: "Jupiter",
        overview: "Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass more than two and a half times that of all the other planets in the Solar System combined. Jupiter is the third-brightest natural object in the Earth's night sky after the Moon and Venus. It has been observed since prehistoric times and is named after the Roman god Jupiter.",
        physical: {
            diameter: "139,820 km (11 times Earth's diameter)",
            mass: "1.8982 × 10^27 kg (318 times Earth's mass)",
            composition: "Hydrogen (90%) and helium (10%), potentially rocky core",
            temperature: "Cloud tops: -145°C",
            gravity: "24.79 m/s² (2.5 times Earth's gravity)"
        },
        orbit: {
            distance: "778.5 million km from the Sun (5.2 AU)",
            period: "11.86 Earth years",
            speed: "13.1 km/s",
            rotation: "9 hours, 56 minutes (fastest rotating planet)",
            tilt: "3.13 degrees"
        },
        atmosphere: {
            composition: "Hydrogen (89%), helium (10%), methane, ammonia, water vapor",
            features: "Great Red Spot (persistent anticyclonic storm), bands of clouds, lightning, aurora"
        },
        texturePath: "Images/Jupiter.jpg"
    },
    saturn: {
        name: "Saturn",
        overview: "Saturn is the sixth planet from the Sun and the second-largest in the Solar System, after Jupiter. It is a gas giant with an average radius of about nine and a half times that of Earth. It has only one-eighth the average density of Earth; however, with its larger volume, Saturn is over 95 times more massive. Saturn is known for its prominent ring system, which consists of ice, rock, and dust particles.",
        physical: {
            diameter: "116,460 km (9.1 times Earth's diameter)",
            mass: "5.6834 × 10^26 kg (95 times Earth's mass)",
            composition: "Hydrogen (96%) and helium (3%), rocky core",
            temperature: "Cloud tops: -178°C",
            gravity: "10.44 m/s² (1.07 times Earth's gravity)"
        },
        orbit: {
            distance: "1.43 billion km from the Sun (9.5 AU)",
            period: "29.46 Earth years",
            speed: "9.7 km/s",
            rotation: "10 hours, 33 minutes",
            tilt: "26.7 degrees"
        },
        atmosphere: {
            composition: "Hydrogen (96%), helium (3%), methane, ammonia, water vapor",
            features: "Hexagonal cloud pattern at north pole, bands of clouds, storms"
        },
        texturePath: "Images/Saturn.jpg"
    },
    uranus: {
        name: "Uranus",
        overview: "Uranus is the seventh planet from the Sun. It has the third-largest planetary radius and fourth-largest planetary mass in the Solar System. It is similar in composition to Neptune, and both have bulk chemical compositions which differ from that of the larger gas giants Jupiter and Saturn. For this reason, scientists often classify Uranus and Neptune as 'ice giants' to distinguish them.",
        physical: {
            diameter: "50,724 km (4 times Earth's diameter)",
            mass: "8.6810 × 10^25 kg (14.5 times Earth's mass)",
            composition: "Hydrogen (83%), helium (15%), methane (2%), rocky core",
            temperature: "Cloud tops: -224°C",
            gravity: "8.69 m/s² (0.89 times Earth's gravity)"
        },
        orbit: {
            distance: "2.88 billion km from the Sun (19.2 AU)",
            period: "84.02 Earth years",
            speed: "6.8 km/s",
            rotation: "17 hours, 14 minutes (retrograde rotation)",
            tilt: "97.8 degrees (rotates on its side)"
        },
        atmosphere: {
            composition: "Hydrogen (83%), helium (15%), methane (2%)",
            features: "Methane gives the planet its blue-green color, few cloud features, seasonal changes"
        },
        texturePath: "Images/Uranus.jpg"
    },
    neptune: {
        name: "Neptune",
        overview: "Neptune is the eighth and farthest-known Solar planet from the Sun. It is the fourth-largest planet by diameter, the third-most-massive planet, and the densest giant planet. It is 17 times the mass of Earth, and is slightly more massive than its near-twin Uranus. Neptune is denser and physically smaller than Uranus because its greater mass causes more gravitational compression of its atmosphere.",
        physical: {
            diameter: "49,244 km (3.9 times Earth's diameter)",
            mass: "1.02413 × 10^26 kg (17 times Earth's mass)",
            composition: "Hydrogen (80%), helium (19%), methane (1%), rocky core",
            temperature: "Cloud tops: -218°C",
            gravity: "11.15 m/s² (1.14 times Earth's gravity)"
        },
        orbit: {
            distance: "4.5 billion km from the Sun (30.1 AU)",
            period: "164.8 Earth years",
            speed: "5.4 km/s",
            rotation: "16 hours, 6 minutes",
            tilt: "28.3 degrees"
        },
        atmosphere: {
            composition: "Hydrogen (80%), helium (19%), methane (1%)",
            features: "Great Dark Spot, fastest winds in the solar system (up to 2,100 km/h), methane clouds"
        },
        texturePath: "Images/Neptune.jpg"
    },
    pluto: {
        name: "Pluto",
        overview: "Pluto is a dwarf planet in the Kuiper belt, a ring of bodies beyond the orbit of Neptune. It was the first and the largest Kuiper belt object to be discovered. Pluto was discovered by Clyde Tombaugh in 1930 and was originally considered to be the ninth planet from the Sun. After 1992, its status as a planet was questioned following the discovery of several objects of similar size in the Kuiper belt. In 2005, Eris, a dwarf planet in the scattered disc which is 27% more massive than Pluto, was discovered. This led the International Astronomical Union (IAU) to define the term 'planet' formally in 2006, during their 26th General Assembly. That definition excluded Pluto and reclassified it as a dwarf planet.",
        physical: {
            diameter: "2,377 km (0.18 times Earth's diameter)",
            mass: "1.303 × 10^22 kg (0.002 times Earth's mass)",
            composition: "Rock and ice (70% rock, 30% ice)",
            temperature: "Average: -229°C",
            gravity: "0.62 m/s² (0.063 times Earth's gravity)"
        },
        orbit: {
            distance: "5.9 billion km from the Sun (39.5 AU) on average",
            period: "248 Earth years",
            speed: "4.7 km/s",
            rotation: "6.4 Earth days (retrograde rotation)",
            tilt: "122.5 degrees"
        },
        atmosphere: {
            composition: "Nitrogen, methane, carbon monoxide (temporary atmosphere when closer to the Sun)",
            pressure: "0.00001 Pa (billionths of Earth's atmospheric pressure)"
        },
        texturePath: "Images/Pluto.jpg"
    },
};

const orbitalData = {
    sun: {
        radius: 0,
        orbitRadius: 0,
        orbitSpeed: 0,
        rotationSpeed: 0.005,
        color: 0xffcc00,
        size: 20,
        realSize: 695500, // 695,500 km radius
    },
    mercury: {
        radius: 2.4,  // In thousands of km
        orbitRadius: 0.4,  // In AU
        orbitSpeed: 0.04,
        rotationSpeed: 0.0017,
        color: 0xbcb6a5,
        size: 3,
        realSize: 2440, // 2,440 km radius
    },
    venus: {
        radius: 6.1,
        orbitRadius: 0.7,
        orbitSpeed: 0.015,
        rotationSpeed: -0.0004,  // Retrograde rotation
        color: 0xe7cdad,
        size: 5.5,
        realSize: 6052, // 6,052 km radius
    },
    earth: {
        radius: 6.4,
        orbitRadius: 1.0,
        orbitSpeed: 0.01,
        rotationSpeed: 0.01,
        color: 0x2277ff,
        size: 6,
        realSize: 6371, // 6,371 km radius
    },
    mars: {
        radius: 3.4,
        orbitRadius: 1.5,
        orbitSpeed: 0.008,
        rotationSpeed: 0.01,
        color: 0xd58545,
        size: 4,
        realSize: 3390, // 3,390 km radius
    },
    jupiter: {
        radius: 69.9,
        orbitRadius: 5.2,
        orbitSpeed: 0.004,
        rotationSpeed: 0.04,
        color: 0xd8ca9d,
        size: 12,
        realSize: 69911, // 69,911 km radius
    },
    saturn: {
        radius: 58.2,
        orbitRadius: 9.5,
        orbitSpeed: 0.003,
        rotationSpeed: 0.038,
        color: 0xead6b8,
        size: 10,
        realSize: 58232, // 58,232 km radius
    },
    uranus: {
        radius: 25.4,
        orbitRadius: 19.2,
        orbitSpeed: 0.0022,
        rotationSpeed: -0.03,  // Retrograde rotation
        color: 0xc8f3fc,
        size: 7,
        realSize: 25362, // 25,362 km radius
    },
    neptune: {
        radius: 24.6,
        orbitRadius: 30.1,
        orbitSpeed: 0.0018,
        rotationSpeed: 0.032,
        color: 0x3d5ef2,
        size: 6.8,
        realSize: 24622, // 24,622 km radius
    },
    pluto: {
        radius: 1.2,
        orbitRadius: 39.5,
        orbitSpeed: 0.0016,
        rotationSpeed: -0.0066,  // Retrograde rotation
        color: 0xccbbaa,
        size: 2.5,
        realSize: 1188, // 1,188 km radius
    },
}; 