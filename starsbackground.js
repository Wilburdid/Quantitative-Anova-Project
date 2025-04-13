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

camera.position.z = 200;

// Rotate stars animation
function animate() {
    requestAnimationFrame(animate);
    stars.rotation.y += 0.0001;
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
