// Global variables
let scene, camera, renderer, controls;
let planets = {};
let sun;
let clock = new THREE.Clock();
let timeSpeed = 1;
let realScale = false;
let selectedPlanet = null;
let orbitLines = [];
let cameraTarget = new THREE.Vector3();
let cameraFollowing = false;
let uiHidden = false;
let startTime = 0;
let mainMenuActive = true;

// Initialize the application
function init() {
    createScene();
    createLights();
    createStarfield();
    createSolarSystem();
    createEventListeners();
    animate();
    
    // Add animation classes to UI elements
    document.querySelector('header').classList.add('scale-in');
    document.querySelector('#menu-button').classList.add('fade-in');
    document.querySelector('#toggle-ui-container').classList.add('fade-in');
    
    // Position camera for initial view
    camera.position.set(0, 150, 400);
    camera.lookAt(0, 0, 0);
    
    // Show main menu by default
    document.getElementById('main-menu').classList.remove('hidden');
    mainMenuActive = true;
}

// Create the Three.js scene, camera, and renderer
function createScene() {
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        10000
    );
    camera.position.set(0, 50, 150);
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
    // Create orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 0.5;
    controls.minDistance = 10;
    controls.maxDistance = 1000;
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Create lights
function createLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
    // Point light at the center (Sun)
    const sunLight = new THREE.PointLight(0xffffff, 2, 1000, 0.5);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
}

// Create starfield background
function createStarfield() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        sizeAttenuation: false
    });
    
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Add some constellations (brighter stars in patterns)
    const constellationGeometry = new THREE.BufferGeometry();
    const constellationMaterial = new THREE.PointsMaterial({
        color: 0xffffcc,
        size: 1.2,
        sizeAttenuation: false
    });
    
    // Define constellation patterns
    const constellationPatterns = [
        // Orion (simplified)
        [100, 50, -200, 120, 60, -200, 140, 70, -200, 90, 30, -200, 110, 40, -200, 130, 30, -200],
        // Big Dipper (simplified)
        [-150, 100, -300, -130, 120, -300, -110, 130, -300, -90, 140, -300, -70, 130, -300, -50, 140, -300, -40, 120, -300],
        // Cassiopeia (simplified)
        [200, 100, -250, 220, 120, -250, 240, 100, -250, 260, 120, -250, 280, 100, -250]
    ];
    
    const constellationVertices = [];
    constellationPatterns.forEach(pattern => {
        for (let i = 0; i < pattern.length; i += 3) {
            constellationVertices.push(pattern[i], pattern[i+1], pattern[i+2]);
        }
    });
    
    constellationGeometry.setAttribute('position', new THREE.Float32BufferAttribute(constellationVertices, 3));
    const constellations = new THREE.Points(constellationGeometry, constellationMaterial);
    scene.add(constellations);
}

// Create the solar system with planets and orbits
function createSolarSystem() {
    // Create the sun
    const sunTexture = new THREE.TextureLoader().load(planetData.sun.texturePath);
    const sunGeometry = new THREE.SphereGeometry(orbitalData.sun.size, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        emissive: 0xffcc00,
        emissiveIntensity: 0.5
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { planetId: 'sun' };
    scene.add(sun);
    planets.sun = sun;
    
    // Create a glow effect for the sun
    const sunGlowGeometry = new THREE.SphereGeometry(orbitalData.sun.size + 2, 32, 32);
    const sunGlowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            c: { value: 0.2 },
            p: { value: 3.0 },
            glowColor: { value: new THREE.Color(0xffcc00) },
            viewVector: { value: camera.position }
        },
        vertexShader: `
            uniform vec3 viewVector;
            uniform float c;
            uniform float p;
            varying float intensity;
            void main() {
                vec3 vNormal = normalize(normal);
                vec3 vNormel = normalize(viewVector);
                intensity = pow(c - dot(vNormal, vNormel), p);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 glowColor;
            varying float intensity;
            void main() {
                vec3 glow = glowColor * intensity;
                gl_FragColor = vec4(glow, 1.0);
            }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
    
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    sun.add(sunGlow);
    
    // Create each planet and its orbit
    Object.keys(orbitalData).forEach(planetId => {
        if (planetId === 'sun') return; // Skip the sun
        
        const planet = createPlanet(planetId);
        planets[planetId] = planet;
        scene.add(planet);
        
        // Create the orbit line
        const orbitLine = createOrbitLine(planetId);
        orbitLines.push(orbitLine);
        scene.add(orbitLine);
    });
    
    // Position planets initially
    updatePlanetPositions(0);
}

// Create a planet mesh
function createPlanet(planetId) {
    const data = orbitalData[planetId];
    
    // Create planet texture
    const texture = new THREE.TextureLoader().load(planetData[planetId].texturePath);
    
    // Create planet geometry and material
    const planetSize = realScale ? data.realSize / 10000 : data.size;
    const geometry = new THREE.SphereGeometry(planetSize, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.1,
        roughness: 0.8
    });
    
    // Create the planet mesh
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    planet.userData = { planetId: planetId };
    
    // Add a simple ring for Saturn
    if (planetId === 'saturn') {
        const ringGeometry = new THREE.RingGeometry(
            planetSize * 1.3,
            planetSize * 2.0,
            64
        );
        const ringMaterial = new THREE.MeshStandardMaterial({
            color: 0xc9a880,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            roughness: 0.9
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
    }
    
    return planet;
}

// Create orbit line
function createOrbitLine(planetId) {
    const data = orbitalData[planetId];
    const orbitRadius = realScale 
        ? data.orbitRadius * 40  // Larger multiplier for real scale
        : data.orbitRadius * 50; // Larger spacing for visual mode
    
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
        color: 0x444455,
        transparent: true,
        opacity: 0.3,
        linewidth: 1
    });
    
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = orbitRadius * Math.cos(theta);
        const z = orbitRadius * Math.sin(theta);
        points.push(new THREE.Vector3(x, 0, z));
    }
    
    geometry.setFromPoints(points);
    return new THREE.Line(geometry, material);
}

// Update planet positions based on time
function updatePlanetPositions(time) {
    Object.keys(planets).forEach(planetId => {
        if (planetId === 'sun') return; // Skip the sun
        
        const planet = planets[planetId];
        const data = orbitalData[planetId];
        
        // Calculate orbital position
        const orbitRadius = realScale 
            ? data.orbitRadius * 40  // Larger multiplier for real scale to prevent planets from being inside the sun
            : data.orbitRadius * 50; // Larger spacing for visual mode to prevent planet intersection
        
        const angle = time * data.orbitSpeed * timeSpeed;
        
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        
        // Update planet position
        planet.position.set(x, 0, z);
        
        // Update planet rotation
        planet.rotation.y += data.rotationSpeed * timeSpeed;
    });
    
    // Update the sun's rotation
    planets.sun.rotation.y += orbitalData.sun.rotationSpeed * timeSpeed;
    
    // Update orbit lines visibility based on scale
    orbitLines.forEach((line) => {
        line.visible = !realScale;
    });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();
    
    // Update planet positions only if main menu is not active
    if (!mainMenuActive) {
        updatePlanetPositions(elapsedTime - startTime);
    }
    
    // Update TWEEN animations
    TWEEN.update();
    
    // Camera following selected planet
    if (cameraFollowing && selectedPlanet && planets[selectedPlanet] && !mainMenuActive) {
        // Update the camera target
        cameraTarget.copy(planets[selectedPlanet].position);
        
        // Smoothly move camera to follow the planet
        controls.target.lerp(cameraTarget, 0.05);
        controls.update();
    } else {
        // Update controls
        controls.update();
    }
    
    // Render the scene
    renderer.render(scene, camera);
}

// Set up event listeners
function createEventListeners() {
    // Main menu buttons
    document.getElementById('start-expedition').addEventListener('click', startExpedition);
    document.getElementById('settings-button').addEventListener('click', openSettings);
    document.getElementById('about-button').addEventListener('click', showAboutInfo);
    
    // Settings panel
    document.querySelector('#settings-panel .close-button').addEventListener('click', closeSettings);
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // Settings controls
    document.getElementById('quality-select').addEventListener('change', updateQuality);
    document.getElementById('stars-density').addEventListener('input', updateStarsDensity);
    document.getElementById('rotation-speed').addEventListener('input', updateRotationSpeed);
    document.getElementById('zoom-speed').addEventListener('input', updateZoomSpeed);
    document.getElementById('orbit-lines').addEventListener('change', updateOrbitLines);
    document.getElementById('planet-labels').addEventListener('change', updatePlanetLabels);
    
    // Reset view button
    document.getElementById('reset-system').addEventListener('click', resetView);
    
    // Toggle UI visibility
    document.getElementById('toggle-ui').addEventListener('click', toggleUI);
    
    // Toggle real scale
    document.getElementById('toggle-scale').addEventListener('click', toggleScale);
    
    // Set real-time speed
    document.getElementById('real-time').addEventListener('click', setRealTime);
    
    // Time speed slider
    document.getElementById('time-speed').addEventListener('input', updateTimeSpeed);
    
    // Menu button
    document.getElementById('menu-button').addEventListener('click', togglePlanetMenu);
    
    // Close planet info
    document.querySelector('#planet-info .close-button').addEventListener('click', closePlanetInfo);
    
    // Click on planets in the menu
    document.querySelectorAll('#planet-menu li').forEach(item => {
        item.addEventListener('click', () => {
            const planetId = item.getAttribute('data-planet');
            selectPlanet(planetId);
        });
    });
    
    // Tab buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            selectTab(tab);
        });
    });
    
    // Click on planets in 3D scene
    renderer.domElement.addEventListener('click', onSceneClick);
    
    // Key controls
    window.addEventListener('keydown', onKeyDown);
    
    // Window resize
    window.addEventListener('resize', onWindowResize);
}

// Handle scene clicks to select planets
function onSceneClick(event) {
    // Calculate mouse position in normalized device coordinates
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Raycasting to detect intersections
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Check for intersections with planets
    const planetObjects = Object.values(planets);
    const intersects = raycaster.intersectObjects(planetObjects, true);
    
    if (intersects.length > 0) {
        // Get the first intersected object
        let intersectedObject = intersects[0].object;
        
        // Traverse up to find parent with planetId
        while (intersectedObject && !intersectedObject.userData.planetId) {
            intersectedObject = intersectedObject.parent;
        }
        
        if (intersectedObject && intersectedObject.userData.planetId) {
            selectPlanet(intersectedObject.userData.planetId);
        }
    }
}

// Select a planet and show its info
function selectPlanet(planetId) {
    // Update selected planet
    selectedPlanet = planetId;
    cameraFollowing = true;
    
    // Highlight the selected planet in the menu
    document.querySelectorAll('#planet-menu li').forEach(item => {
        if (item.getAttribute('data-planet') === planetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update the planet info panel
    updatePlanetInfo(planetId);
    
    // Show the planet info panel
    document.getElementById('planet-info').classList.add('active');
    
    // Move camera to the selected planet
    if (planets[planetId]) {
        // Set up the camera animation
        const planet = planets[planetId];
        const data = orbitalData[planetId];
        
        // Get closer to the planet for a better view
        const distance = planetId === 'sun' 
            ? (data.size || 20) * 2 
            : (data.size || 5) * 3;
        
        // Animate camera position to focus on the planet
        const targetPosition = new THREE.Vector3().copy(planet.position);
        
        // Calculate offset based on planet position
        const directionToSun = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), targetPosition).normalize();
        
        // Position camera at a distance from the planet, opposite from the sun for better view
        const offset = new THREE.Vector3().copy(directionToSun).multiplyScalar(-distance * 1.5);
        offset.y = distance * 0.8; // Add some height
        
        // Camera position is the planet position plus the offset
        const newPosition = new THREE.Vector3().copy(targetPosition).add(offset);
        
        // Disable controls temporarily for smooth camera movement
        controls.enabled = false;
        
        // Use TWEEN to animate camera movement
        new TWEEN.Tween(camera.position)
            .to({
                x: newPosition.x,
                y: newPosition.y,
                z: newPosition.z
            }, 2000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                camera.lookAt(targetPosition);
            })
            .onComplete(() => {
                // Re-enable controls and set the target
                controls.enabled = true;
                controls.target.copy(targetPosition);
                cameraTarget.copy(targetPosition);
            })
            .start();
    }
}

// Update planet information panel
function updatePlanetInfo(planetId) {
    const planet = planetData[planetId];
    
    document.getElementById('planet-name').textContent = planet.name;
    
    // Show the overview tab by default
    selectTab('overview');
}

// Select a tab in the planet info panel
function selectTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-button').forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update tab content
    const tabContent = document.getElementById('tab-content');
    const planet = planetData[selectedPlanet];
    
    if (!planet) return;
    
    let content = '';
    
    switch (tabName) {
        case 'overview':
            content = `<p>${planet.overview}</p>`;
            break;
            
        case 'physical':
            content = `
                <h3>Physical Characteristics</h3>
                <table>
                    <tr>
                        <th>Diameter</th>
                        <td>${planet.physical.diameter}</td>
                    </tr>
                    <tr>
                        <th>Mass</th>
                        <td>${planet.physical.mass}</td>
                    </tr>
                    <tr>
                        <th>Composition</th>
                        <td>${planet.physical.composition}</td>
                    </tr>
                    <tr>
                        <th>Temperature</th>
                        <td>${planet.physical.temperature}</td>
                    </tr>
                    <tr>
                        <th>Gravity</th>
                        <td>${planet.physical.gravity}</td>
                    </tr>
                </table>
            `;
            break;
            
        case 'orbit':
            content = `
                <h3>Orbital Characteristics</h3>
                <table>
                    ${planet.orbit.distance ? `<tr>
                        <th>Distance from Sun</th>
                        <td>${planet.orbit.distance}</td>
                    </tr>` : ''}
                    <tr>
                        <th>Orbital Period</th>
                        <td>${planet.orbit.period}</td>
                    </tr>
                    <tr>
                        <th>Orbital Speed</th>
                        <td>${planet.orbit.speed}</td>
                    </tr>
                    <tr>
                        <th>Rotation Period</th>
                        <td>${planet.orbit.rotation}</td>
                    </tr>
                    ${planet.orbit.tilt ? `<tr>
                        <th>Axial Tilt</th>
                        <td>${planet.orbit.tilt}</td>
                    </tr>` : ''}
                </table>
            `;
            break;
            
        case 'atmosphere':
            content = `
                <h3>Atmospheric Composition</h3>
                <p>${planet.atmosphere.composition}</p>
                
                ${planet.atmosphere.pressure ? `
                <h3>Atmospheric Pressure</h3>
                <p>${planet.atmosphere.pressure}</p>
                ` : ''}
                
                ${planet.atmosphere.features ? `
                <h3>Notable Features</h3>
                <p>${planet.atmosphere.features}</p>
                ` : ''}
            `;
            break;
    }
    
    tabContent.innerHTML = content;
    
    // Add animation to tab content
    tabContent.classList.remove('fade-in');
    void tabContent.offsetWidth; // Trigger reflow
    tabContent.classList.add('fade-in');
}

// Toggle UI visibility
function toggleUI() {
    const button = document.getElementById('toggle-ui');
    document.body.classList.toggle('hidden-ui');
    
    uiHidden = document.body.classList.contains('hidden-ui');
    
    if (uiHidden) {
        button.textContent = 'Show UI';
    } else {
        button.textContent = 'Hide UI';
    }
}

// Toggle scale between visual and realistic
function toggleScale() {
    realScale = !realScale;
    
    const button = document.getElementById('toggle-scale');
    button.textContent = realScale ? 'Toggle Visual Scale' : 'Toggle Real Scale';
    
    // Update sun size
    const sunSize = realScale ? orbitalData.sun.realSize / 10000 : orbitalData.sun.size;
    planets.sun.scale.set(1, 1, 1); // Reset scale
    planets.sun.geometry = new THREE.SphereGeometry(sunSize, 64, 64);
    
    // Update all planet sizes and positions
    Object.keys(planets).forEach(planetId => {
        if (planetId === 'sun') return; // Skip sun, already handled
        
        const planet = planets[planetId];
        const data = orbitalData[planetId];
        const planetSize = realScale ? data.realSize / 10000 : data.size;
        
        // Update planet size
        planet.geometry = new THREE.SphereGeometry(planetSize, 32, 32);
        
        // Update orbit lines
        const orbitIndex = Object.keys(orbitalData).indexOf(planetId) - 1; // -1 because sun is first
        if (orbitIndex >= 0 && orbitLines[orbitIndex]) {
            scene.remove(orbitLines[orbitIndex]);
            orbitLines[orbitIndex] = createOrbitLine(planetId);
            scene.add(orbitLines[orbitIndex]);
        }
    });
    
    // If a planet is selected, re-focus on it
    if (selectedPlanet) {
        selectPlanet(selectedPlanet);
    }
}

// Set real-time simulation
function setRealTime() {
    timeSpeed = 0.01; // Very slow, close to real-time
    document.getElementById('time-speed').value = timeSpeed;
    document.getElementById('speed-value').textContent = timeSpeed + 'x';
}

// Update time speed from slider
function updateTimeSpeed(e) {
    timeSpeed = parseFloat(e.target.value);
    document.getElementById('speed-value').textContent = timeSpeed + 'x';
}

// Toggle planet menu
function togglePlanetMenu() {
    const menuButton = document.getElementById('menu-button');
    const planetMenu = document.getElementById('planet-menu');
    
    menuButton.classList.toggle('active');
    planetMenu.classList.toggle('active');
}

// Close planet info panel
function closePlanetInfo() {
    document.getElementById('planet-info').classList.remove('active');
    cameraFollowing = false;
    selectedPlanet = null;
    
    // Reset camera to default view
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 50, z: 150 }, 1500)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(new THREE.Vector3(0, 0, 0));
        })
        .onComplete(() => {
            controls.target.set(0, 0, 0);
        })
        .start();
        
    // Reset planet menu selection
    document.querySelectorAll('#planet-menu li').forEach(item => {
        item.classList.remove('active');
    });
}

// Start expedition button click
function startExpedition() {
    const mainMenu = document.getElementById('main-menu');
    mainMenu.classList.add('hidden');
    mainMenuActive = false;
    
    // Reset clock to start time tracking from now
    startTime = clock.getElapsedTime();
    
    // Animate camera to a good starting position
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 100, z: 300 }, 3000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            camera.lookAt(0, 0, 0);
        })
        .onComplete(() => {
            controls.target.set(0, 0, 0);
        })
        .start();
}

// Show About information
function showAboutInfo() {
    // We could create a modal dialog here
    alert('Solar System Explorer - An interactive 3D visualization of our solar system.');
}

// Reset view to default position
function resetView() {
    // Reset camera to default position
    closePlanetInfo();
    cameraFollowing = false;
    selectedPlanet = null;
    
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 100, z: 300 }, 2000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            camera.lookAt(0, 0, 0);
        })
        .onComplete(() => {
            controls.target.set(0, 0, 0);
        })
        .start();
}

// Handle keyboard controls
function onKeyDown(event) {
    if (event.key === 'Escape') {
        if (mainMenuActive) {
            return;
        }
        
        if (document.getElementById('settings-panel').classList.contains('hidden') === false) {
            closeSettings();
        } else if (document.getElementById('planet-info').classList.contains('active')) {
            closePlanetInfo();
        } else {
            // Toggle main menu
            const mainMenu = document.getElementById('main-menu');
            mainMenu.classList.toggle('hidden');
            mainMenuActive = !mainMenu.classList.contains('hidden');
        }
    } else if (event.key === 'h') {
        toggleUI();
    } else if (event.key === 's') {
        if (mainMenuActive) {
            openSettings();
        } else {
            toggleScale();
        }
    } else if (event.key === 'm') {
        togglePlanetMenu();
    } else if (event.key === 'r') {
        resetView();
    }
}

// Open settings panel
function openSettings() {
    document.getElementById('settings-panel').classList.remove('hidden');
}

// Close settings panel
function closeSettings() {
    document.getElementById('settings-panel').classList.add('hidden');
}

// Save settings
function saveSettings() {
    // Apply all settings at once
    updateQuality();
    updateStarsDensity();
    updateRotationSpeed();
    updateZoomSpeed();
    updateOrbitLines();
    updatePlanetLabels();
    
    // Close settings panel
    closeSettings();
}

// Update render quality
function updateQuality() {
    const quality = document.getElementById('quality-select').value;
    
    switch (quality) {
        case 'low':
            renderer.setPixelRatio(window.devicePixelRatio * 0.5);
            break;
        case 'medium':
            renderer.setPixelRatio(window.devicePixelRatio);
            break;
        case 'high':
            renderer.setPixelRatio(window.devicePixelRatio * 1.5);
            break;
    }
}

// Update stars density
function updateStarsDensity() {
    // This would typically recreate the starfield with a new density
    // For now, we'll just log it
    const density = document.getElementById('stars-density').value;
    console.log(`Stars density set to: ${density}`);
    // In a real implementation, this would recreate the starfield
}

// Update camera rotation speed
function updateRotationSpeed() {
    const speed = parseFloat(document.getElementById('rotation-speed').value);
    controls.rotateSpeed = speed;
}

// Update camera zoom speed
function updateZoomSpeed() {
    const speed = parseFloat(document.getElementById('zoom-speed').value);
    controls.zoomSpeed = speed;
}

// Update orbit lines visibility
function updateOrbitLines() {
    const showOrbitLines = document.getElementById('orbit-lines').checked;
    orbitLines.forEach(line => {
        line.visible = showOrbitLines && !realScale;
    });
}

// Update planet labels
function updatePlanetLabels() {
    const showLabels = document.getElementById('planet-labels').checked;
    // Implementation would add/remove labels from planets
    console.log(`Planet labels: ${showLabels ? 'shown' : 'hidden'}`);
    // In a real implementation, this would add/show planet labels
}

// Initialize the application when loaded
window.addEventListener('load', init); 