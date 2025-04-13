const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('background'),
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);

// Create stars background
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 5000;
const starsPosArray = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
    starsPosArray[i] = (Math.random() - 0.5) * 2000;
}

starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPosArray, 3));

const starsMaterial = new THREE.PointsMaterial({
    size: 0.5,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Create sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.9
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create planets
const planets = [];
const planetData = [
    { size: 2, distance: 20, color: 0x888888, speed: 0.01 }, // Mercury
    { size: 3, distance: 30, color: 0xffa500, speed: 0.008 }, // Venus
    { size: 3.5, distance: 40, color: 0x0000ff, speed: 0.006 }, // Earth
    { size: 2.5, distance: 50, color: 0xff0000, speed: 0.004 }, // Mars
    { size: 8, distance: 70, color: 0xffd700, speed: 0.002 }, // Jupiter
    { size: 7, distance: 90, color: 0xffa07a, speed: 0.0015 }, // Saturn
    { size: 5, distance: 110, color: 0x00ffff, speed: 0.001 }, // Uranus
    { size: 4.5, distance: 130, color: 0x0000ff, speed: 0.0008 } // Neptune
];

planetData.forEach((data, index) => {
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: data.color,
        transparent: true,
        opacity: 0.9
    });
    const planet = new THREE.Mesh(geometry, material);
    
    // Create orbit path
    const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
    const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
    });
    const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2;
    scene.add(orbit);
    
    planets.push({
        mesh: planet,
        distance: data.distance,
        speed: data.speed,
        angle: Math.random() * Math.PI * 2
    });
    scene.add(planet);
});

// Add ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

// Add point light for sun
const sunLight = new THREE.PointLight(0xffff00, 1, 1000);
sun.add(sunLight);

camera.position.z = 200;

// Handle mouse movement for camera control
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.005;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.005;
});

// Animation
function animate() {
    requestAnimationFrame(animate);
    
    // Rotate stars
    stars.rotation.y += 0.0001;
    
    // Rotate sun
    sun.rotation.y += 0.001;
    
    // Update planets
    planets.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
        planet.mesh.rotation.y += 0.01;
    });
    
    // Smooth camera movement
    targetX = mouseX;
    targetY = mouseY;
    
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    
    camera.lookAt(scene.position);
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate(); 
