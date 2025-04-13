 let scene, camera, renderer, controls, stats;
let sun, planets = [], starField;
let homeGalaxy, galaxies = [], superClusters = [];
let lastTime = 0, timeScale = 1;
let isPaused = false, isLabelVisible = true;
let homeGalaxySize = 100000;  
 const settings = {
    graphicsQuality: 3,       planetSize: 2,            orbitSpeed: 1,            showOrbitLines: true,
    showPlanetLabels: true,
    useRealScale: false   };

 const viewingSettings = {
    maxZoomDistance: 300,                starVisibilityDistance: 10,          galaxyVisibilityDistance: 50,        clusterVisibilityDistance: 150,      superClusterVisibilityDistance: 300,      galaxySaturation: 0.2,               starBrightness: 0.8,                 cosmicWebVisibility: true,           autoHideDistantObjects: true,        showStars: true,                     showGalaxies: true,                  showSuperClusters: true,             onlyHomeGalaxy: false            };

let clock = new THREE.Clock();
let timeSpeed = 1;
let lastTimeSpeed = 1;
let accumulatedTime = 0;
let lastFrameTime = 0;
let smoothTimeSpeed = 1;
let targetTimeSpeed = 1;
let timeSpeedLerpFactor = 0.15; let galaxyRotationSpeed = 0.00004; let realScale = false;
let selectedPlanet = null;
let orbitLines = [];
let cameraTarget = new THREE.Vector3();
let cameraFollowing = false;
let uiHidden = false;
let startTime = 0;
let defaultMaxDistance = 500000000;  let galaxyClusters = [];  let currentCameraDistance = 0;  let lastLODTime = 0;
let lodUpdateInterval = 100;
let activeCameraTween = null;  
 let moons = {}; let initialPlanetAngles = {};  let initialMoonAngles = {};    
function resetSystem() {
        while(scene.children.length > 0){ 
        scene.remove(scene.children[0]); 
    }
    
        planets = [];
    galaxies = [];
    superClusters = [];
    galaxyClusters = [];
    orbitLines = [];
    moons = {};
    initialPlanetAngles = {};
    initialMoonAngles = {};
    
        camera.position.set(0, 500, 1500);
    camera.lookAt(0, 0, 0);
    controls.target.set(0, 0, 0);
    
        accumulatedTime = 0;
    lastFrameTime = clock.getElapsedTime();
    selectedPlanet = null;
    cameraFollowing = false;
    
        createLights();
    createStarfield();
    createHomeGalaxy();
    createDistantGalaxies();
    createGalaxyClusters();
    createSolarSystem();
}

 function init() {
    createScene();
    createLights();
    createStarfield();
    createHomeGalaxy();
    createDistantGalaxies();
    createGalaxyClusters();
    createDistantSuperClusters();
    createSolarSystem();
    
        const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel) {
        settingsPanel.classList.add('hidden');
        settingsPanel.style.zIndex = '1000';
    }
    
        const aboutPanel = document.getElementById('about-panel');
    if (aboutPanel) {
        aboutPanel.classList.add('hidden');
        aboutPanel.style.zIndex = '1000';
    }
    
        createEventListeners();
    
        makePanelsDraggable();
    
        document.body.classList.add('hidden-ui');
    document.getElementById('ui-container').style.transform = 'translateY(-100%)';
    document.getElementById('ui-container').style.opacity = '0';
    document.getElementById('ui-container').style.visibility = 'hidden';
    uiHidden = true;
    
    document.getElementById('main-menu').classList.remove('hidden');
    mainMenuActive = true;
    
        animate();
}

 function createScene() {
    scene = new THREE.Scene();
    
         camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000000000       );
    camera.position.set(0, 500, 1500);
    
         renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);      renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('scene-container').appendChild(renderer.domElement);
    
         controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.5;      controls.minDistance = 10;
    controls.maxDistance = defaultMaxDistance;
    
         controls.addEventListener('start', stopActiveCameraTween);
    
         mainMenuActive = true;
    
         document.getElementById('toggle-ui-container').style.display = 'none';
    
         createLights();
    createStarfield();
    
         camera.position.set(0, 500, 1500);
    camera.lookAt(0, 0, 0);
}

 function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

 function createLights() {
         const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);
    
         const sunLight = new THREE.PointLight(0xffffff, 0.5, 1000, 0.5);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);
}

 function createStarfield() {
            
        const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.0,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });
    
    const starVertices = [];
    const starCount = 10000;
    
    for (let i = 0; i < starCount; i++) {
        const r = 200000 + Math.random() * 800000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);
        
        starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starField = new THREE.Points(starGeometry, starMaterial);
    starField.userData = { isStarField: true };
    scene.add(starField);
}

 function createHomeGalaxy() {
         const galaxyGeometries = {
        core: new THREE.BufferGeometry(),
        arms: new THREE.BufferGeometry(),
        halo: new THREE.BufferGeometry()
    };
    
    const galaxyMaterials = {
        core: new THREE.PointsMaterial({
            color: 0xffffee,
            size: 1.0,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9
        }),
        arms: new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.8,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.8
        }),
        halo: new THREE.PointsMaterial({
            color: 0xeeeeff,
            size: 0.7,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6
        })
    };
    
         const vertices = {
        core: [],
        arms: [],
        halo: []
    };
    
         const galaxyRadius = 100000;      const spiralArms = 8;            const spiralTightness = 0.25;      
         const coreHeight = galaxyRadius * 0.15;      const diskHeight = galaxyRadius * 0.025;      
         const solarSystemDistance = galaxyRadius * 0.65;      const solarSystemAngle = Math.PI * 0.3;      const solarSystemVector = new THREE.Vector3(
        Math.cos(solarSystemAngle) * solarSystemDistance,
        0,
        Math.sin(solarSystemAngle) * solarSystemDistance
    );
    
         const coreStarCount = 7000;        const armStarCount = 25000;        const haloStarCount = 5000;        
         for (let i = 0; i < coreStarCount; i++) {
                 const r = Math.pow(Math.random(), 0.5) * galaxyRadius * 0.25;          const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
                 const flattenFactor = 0.4;          
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta) * flattenFactor;
        const z = r * Math.cos(phi) * flattenFactor;
        
        vertices.core.push(x, y, z);
    }
    
         for (let i = 0; i < armStarCount; i++) {
                 const distanceFromCenter = Math.pow(Math.random(), 0.4) * galaxyRadius;
        const angle = Math.random() * Math.PI * 2;
        
                 const armIndex = Math.floor(angle / (Math.PI * 2 / spiralArms));
        const armCenterAngle = armIndex * (Math.PI * 2 / spiralArms);
        const angleFromArmCenter = angle - armCenterAngle;
        const normalizedArmOffset = angleFromArmCenter / (Math.PI * 2 / spiralArms);
        
                 const armDist = Math.abs(normalizedArmOffset - 0.5) * 2;          const armFactor = Math.pow(Math.max(0, 1 - armDist * 1.8), 2.5);          
                 const spiralFactor = Math.pow(distanceFromCenter / galaxyRadius, spiralTightness);
        const spiralAngle = armCenterAngle + spiralFactor * 7;          
                 if (Math.random() < armFactor * 0.9 || distanceFromCenter < galaxyRadius * 0.2) {
                                      const armPhase = (distanceFromCenter / galaxyRadius * 8 + armIndex) * Math.PI;
            const armHeightVariation = Math.sin(armPhase) * 0.4 + 0.6;              
                         const heightFactor = (1 - 0.6 * (distanceFromCenter / galaxyRadius)) * armHeightVariation;
            const thickness = diskHeight * heightFactor;
            
                                      let height;
            const heightRand = Math.random();
            if (heightRand < 0.8) {
                                 height = ((Math.random() + Math.random() + Math.random() + Math.random()) / 4 - 0.5) * thickness;
            } else {
                                 height = (Math.random() - 0.5) * thickness * 2.5;
            }
            
                         const x = Math.cos(spiralAngle) * distanceFromCenter;
            const y = height;
            const z = Math.sin(spiralAngle) * distanceFromCenter;
            
                         const armWidth = 0.12;                           const scatterFactor = 0.5 + 0.5 * (distanceFromCenter / galaxyRadius);
            const scatter = armWidth * distanceFromCenter * (1 - Math.pow(armFactor, 2) * 0.8) * scatterFactor;
            const scatterAngle = Math.random() * Math.PI * 2;
            
            const finalX = x + Math.cos(scatterAngle) * scatter * Math.random();
            const finalZ = z + Math.sin(scatterAngle) * scatter * Math.random();
            
            vertices.arms.push(finalX, y, finalZ);
        }
    }
    
         for (let i = 0; i < haloStarCount; i++) {
                 const r = Math.pow(Math.random(), 0.5) * galaxyRadius * 1.2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
                 const verticalCompression = 0.5;          
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta) * verticalCompression;          const z = r * Math.cos(phi);
        
        vertices.halo.push(x, y, z);
    }
    
         ['core', 'arms', 'halo'].forEach(component => {
        for (let i = 0; i < vertices[component].length; i += 3) {
            vertices[component][i] -= solarSystemVector.x;
            vertices[component][i+1] -= solarSystemVector.y; 
            vertices[component][i+2] -= solarSystemVector.z;
        }
    });
    
         const galaxy = new THREE.Group();
    
         Object.keys(vertices).forEach(component => {
        if (vertices[component].length > 0) {
            galaxyGeometries[component].setAttribute('position', 
                new THREE.Float32BufferAttribute(vertices[component], 3));
            
            const mesh = new THREE.Points(galaxyGeometries[component], galaxyMaterials[component]);
            mesh.userData = {
                component: component,
                baseSize: galaxyMaterials[component].size,
                starCount: vertices[component].length / 3,
                isHomeGalaxyComponent: true
            };
            
            galaxy.add(mesh);
        }
    });
    
         galaxy.userData = {
        isHomeGalaxy: true,
        baseSize: 0.8,
        rotationSpeed: galaxyRotationSpeed
    };
    galaxy.frustumCulled = false;      
    scene.add(galaxy);
    homeGalaxy = galaxy;
    
         const constellationGeometry = new THREE.BufferGeometry();
    const constellationMaterial = new THREE.PointsMaterial({
        color: 0xffffcc,
        size: 1.5,
        sizeAttenuation: true      });
    
         const constellationPatterns = [
                 [500, 20, 300, 550, 30, 350, 600, 40, 400, 450, 10, 250, 500, 25, 300, 550, 15, 350],
                 [-400, 50, -600, -450, 60, -650, -500, 70, -700, -550, 80, -750, -600, 70, -800, -650, 80, -850, -700, 60, -900],
                 [-300, 40, 700, -350, 50, 750, -400, 40, 800, -450, 50, 850, -500, 40, 900]
    ];
    
    const constellationVertices = [];
    constellationPatterns.forEach(pattern => {
        for (let i = 0; i < pattern.length; i += 3) {
            constellationVertices.push(pattern[i], pattern[i+1], pattern[i+2]);
        }
    });
    
    constellationGeometry.setAttribute('position', new THREE.Float32BufferAttribute(constellationVertices, 3));
    const constellations = new THREE.Points(constellationMaterial, constellationGeometry);
    constellations.frustumCulled = false;      scene.add(constellations);
}

 function createDistantGalaxies() {
         const galaxyColors = [
        0x8899aa,          0xaa9988,          0x998877,          0x889988,          0x999999,          0xaaaaaa,          0x777788       ];
    
              for (let i = 0; i < 150; i++) {           const distance = 500000 + Math.random() * 2000000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() * 2 - 1);
        
        const galaxyPosition = new THREE.Vector3(
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.sin(phi) * Math.sin(theta),
            distance * Math.cos(phi)
        );
        
                 const galaxy = createGalaxy(
            galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
            galaxyPosition,
            1.5,              Math.max(500, 1000 - Math.floor(distance / 1000000) * 300),              true          );
        
                 galaxy.userData.visibilityLayer = 1;          
                 galaxies.push(galaxy);
    }
    
         for (let i = 0; i < 300; i++) {
        const distance = 3000000 + Math.random() * 7000000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() * 2 - 1);
        
        const galaxyPosition = new THREE.Vector3(
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.sin(phi) * Math.sin(theta),
            distance * Math.cos(phi)
        );
        
                 const galaxy = createGalaxy(
            galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
            galaxyPosition,
            1.2,              Math.max(300, 700 - Math.floor(distance / 2000000) * 200),              true          );
        
                 galaxy.userData.visibilityLayer = 2;          galaxy.visible = false;          
                 galaxies.push(galaxy);
    }
    
         for (let i = 0; i < 500; i++) {
        const distance = 10000000 + Math.random() * 15000000;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() * 2 - 1);
        
        const galaxyPosition = new THREE.Vector3(
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.sin(phi) * Math.sin(theta),
            distance * Math.cos(phi)
        );
        
                 const galaxy = createGalaxy(
            galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
            galaxyPosition,
            1.0,              Math.max(200, 400 - Math.floor(distance / 5000000) * 100),              true          );
        
                 galaxy.userData.visibilityLayer = 3;          galaxy.visible = false;          
                 galaxies.push(galaxy);
    }
}

 function createGalaxyClusters() {
         const galaxyColors = [
        0x8899aa,          0xaa9988,          0x998877,          0x889988,          0x999999,          0xaaaaaa,          0x777788       ];
    
              for (let c = 0; c < 50; c++) {
                 const clusterDistance = 5000000 + Math.random() * 45000000;          const clusterTheta = Math.random() * Math.PI * 2;
        const clusterPhi = Math.acos(2 * Math.random() - 1);
        
        const clusterCenter = new THREE.Vector3(
            clusterDistance * Math.sin(clusterPhi) * Math.cos(clusterTheta),
            clusterDistance * Math.sin(clusterPhi) * Math.sin(clusterTheta),
            clusterDistance * Math.cos(clusterPhi)
        );
        
                 const clusterSize = 1000000 + (clusterDistance / 50000000) * 5000000;
        
                 const clusterGalaxies = Math.min(35, 25 + Math.floor((clusterDistance / 50000000) * 30));
        
                 const clusterGeometry = new THREE.BufferGeometry();
        const clusterMaterial = new THREE.PointsMaterial({
            color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
            size: 3.0,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.7          });
        
        const clusterVertices = [];
        
                 for (let g = 0; g < clusterGalaxies; g++) {
                         const galaxyRadius = Math.pow(Math.random(), 2) * clusterSize;
            const galaxyTheta = Math.random() * Math.PI * 2;
            const galaxyPhi = Math.acos(2 * Math.random() - 1);
            
            const galaxyPosition = new THREE.Vector3(
                clusterCenter.x + galaxyRadius * Math.sin(galaxyPhi) * Math.cos(galaxyTheta),
                clusterCenter.y + galaxyRadius * Math.sin(galaxyPhi) * Math.sin(galaxyTheta),
                clusterCenter.z + galaxyRadius * Math.cos(galaxyPhi)
            );
            
            clusterVertices.push(galaxyPosition.x, galaxyPosition.y, galaxyPosition.z);
        }
        
        clusterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(clusterVertices, 3));
        const cluster = new THREE.Points(clusterGeometry, clusterMaterial);
        
                 cluster.userData.baseSize = 3.0;
        cluster.userData.baseOpacity = 0.7;
        cluster.userData.distanceFromOrigin = clusterDistance;
        cluster.userData.isRepresentative = Math.random() < 0.3;          cluster.userData.visibilityLayer = 1;          cluster.position.copy(clusterCenter);          
        scene.add(cluster);
        galaxyClusters.push(cluster);
    }
    
         for (let c = 0; c < 80; c++) {
                 const clusterDistance = 50000000 + Math.random() * 100000000;          const clusterTheta = Math.random() * Math.PI * 2;
        const clusterPhi = Math.acos(2 * Math.random() - 1);
        
        const clusterCenter = new THREE.Vector3(
            clusterDistance * Math.sin(clusterPhi) * Math.cos(clusterTheta),
            clusterDistance * Math.sin(clusterPhi) * Math.sin(clusterTheta),
            clusterDistance * Math.cos(clusterPhi)
        );
        
                 const clusterSize = 3000000 + (clusterDistance / 100000000) * 8000000;
        
                 const clusterGalaxies = Math.min(50, 30 + Math.floor((clusterDistance / 100000000) * 40));
        
                 const clusterGeometry = new THREE.BufferGeometry();
        const clusterMaterial = new THREE.PointsMaterial({
            color: galaxyColors[Math.floor(Math.random() * galaxyColors.length)],
            size: 4.0,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.6          });
        
        const clusterVertices = [];
        
                 for (let g = 0; g < clusterGalaxies; g++) {
                         const galaxyRadius = Math.pow(Math.random(), 1.5) * clusterSize;              const galaxyTheta = Math.random() * Math.PI * 2;
            const galaxyPhi = Math.acos(2 * Math.random() - 1);
            
            const galaxyPosition = new THREE.Vector3(
                clusterCenter.x + galaxyRadius * Math.sin(galaxyPhi) * Math.cos(galaxyTheta),
                clusterCenter.y + galaxyRadius * Math.sin(galaxyPhi) * Math.sin(galaxyTheta),
                clusterCenter.z + galaxyRadius * Math.cos(galaxyPhi)
            );
            
            clusterVertices.push(galaxyPosition.x, galaxyPosition.y, galaxyPosition.z);
        }
        
        clusterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(clusterVertices, 3));
        const cluster = new THREE.Points(clusterGeometry, clusterMaterial);
        
                 cluster.userData.baseSize = 4.0;
        cluster.userData.baseOpacity = 0.6;
        cluster.userData.distanceFromOrigin = clusterDistance;
        cluster.userData.isRepresentative = Math.random() < 0.4;          cluster.userData.visibilityLayer = 2;          cluster.position.copy(clusterCenter);
        cluster.visible = false;          
        scene.add(cluster);
        galaxyClusters.push(cluster);
    }
}

 function createDistantSuperClusters() {
         const superClusterColors = [
        0x6677aa,          0x997766,          0x776655,          0x667766,          0x888888,      ];
    
         for (let c = 0; c < 20; c++) {
                 const clusterDistance = 150000000 + Math.random() * 300000000;          const clusterTheta = Math.random() * Math.PI * 2;
        const clusterPhi = Math.acos(2 * Math.random() - 1);
        
        const clusterCenter = new THREE.Vector3(
            clusterDistance * Math.sin(clusterPhi) * Math.cos(clusterTheta),
            clusterDistance * Math.sin(clusterPhi) * Math.sin(clusterTheta),
            clusterDistance * Math.cos(clusterPhi)
        );
        
                 const clusterSize = 20000000 + (clusterDistance / 300000000) * 50000000;
        
                 const filamentAxis = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize();
        
                 const clusterGeometry = new THREE.BufferGeometry();
        const clusterMaterial = new THREE.PointsMaterial({
            color: superClusterColors[Math.floor(Math.random() * superClusterColors.length)],
            size: 5.0,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.5          });
        
        const clusterVertices = [];
        const numPoints = 200 + Math.floor(Math.random() * 300);          
                 for (let g = 0; g < numPoints; g++) {
                         const axisPosition = (Math.random() * 2 - 1) * clusterSize;
            
                         const offsetFactor = 1.0 - Math.pow(Math.abs(axisPosition / clusterSize), 2);
            const offsetRadius = offsetFactor * clusterSize * 0.2;
            
                         const offsetTheta = Math.random() * Math.PI * 2;
            const offsetX = Math.cos(offsetTheta) * offsetRadius;
            const offsetY = Math.sin(offsetTheta) * offsetRadius;
            
                         const perpVec1 = new THREE.Vector3(0, 1, 0);
            if (Math.abs(filamentAxis.dot(perpVec1)) > 0.9) {
                perpVec1.set(1, 0, 0);
            }
            perpVec1.crossVectors(perpVec1, filamentAxis).normalize();
            const perpVec2 = new THREE.Vector3().crossVectors(filamentAxis, perpVec1).normalize();
            
                         const galaxyPosition = new THREE.Vector3()
                .copy(clusterCenter)
                .add(filamentAxis.clone().multiplyScalar(axisPosition))
                .add(perpVec1.clone().multiplyScalar(offsetX))
                .add(perpVec2.clone().multiplyScalar(offsetY));
            
            clusterVertices.push(galaxyPosition.x, galaxyPosition.y, galaxyPosition.z);
        }
        
        clusterGeometry.setAttribute('position', new THREE.Float32BufferAttribute(clusterVertices, 3));
        const superCluster = new THREE.Points(clusterGeometry, clusterMaterial);
        
                 superCluster.userData.baseSize = 5.0;
        superCluster.userData.baseOpacity = 0.5;
        superCluster.userData.distanceFromOrigin = clusterDistance;
        superCluster.userData.isSuperCluster = true;
        superCluster.userData.visibilityLayer = 3;          superCluster.position.copy(clusterCenter);
        superCluster.visible = false;          
        scene.add(superCluster);
        galaxyClusters.push(superCluster);
    }
}

 function createGalaxy(color, distanceOrPosition, sizeFactor = 1.0, starCount = 2000, useDirectPosition = false) {
              const galaxyGeometries = {
        core: new THREE.BufferGeometry(),
        arms: new THREE.BufferGeometry(),
        halo: new THREE.BufferGeometry()
    };
    
         const galaxyMaterials = {
        core: new THREE.PointsMaterial({
            color: color,
            size: 1.8 * sizeFactor,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9
        }),
        arms: new THREE.PointsMaterial({
            color: color,
            size: 1.5 * sizeFactor,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.7
        }),
        halo: new THREE.PointsMaterial({
            color: color,
            size: 1.2 * sizeFactor,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.5
        })
    };
    
         galaxyMaterials.core.userData = {
        baseSize: 1.8 * sizeFactor,
        baseOpacity: 0.9
    };
    
    galaxyMaterials.arms.userData = {
        baseSize: 1.5 * sizeFactor,
        baseOpacity: 0.7
    };
    
    galaxyMaterials.halo.userData = {
        baseSize: 1.2 * sizeFactor,
        baseOpacity: 0.5
    };
    
         const vertices = {
        core: [],
        arms: [],
        halo: []
    };
    
         const galaxyType = Math.random() < 0.8 ? 0 : (Math.random() < 0.75 ? 1 : 2);
    const galaxyRadius = (15000 + Math.random() * 20000) * sizeFactor;
    
         let galaxyCenter;
    if (useDirectPosition) {
                 galaxyCenter = distanceOrPosition;
    } else {
                 const distance = distanceOrPosition;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        galaxyCenter = new THREE.Vector3(
            distance * Math.sin(phi) * Math.cos(theta),
            distance * Math.sin(phi) * Math.sin(theta),
            distance * Math.cos(phi)
        );
    }
    
         const rotation = new THREE.Matrix4();
    rotation.makeRotationFromEuler(new THREE.Euler(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
    ));
    
         if (galaxyType === 0 || galaxyType === 1) {                   const spiralArms = 2 + Math.floor(Math.random() * 3);                   const spiralTightness = 0.4 + Math.random() * 0.3;                   const armWidth = galaxyType === 0 ? 0.1 + Math.random() * 0.15 : 0.3 + Math.random() * 0.4;
        
                 const coreHeight = galaxyRadius * 0.15;          const diskHeight = galaxyRadius * 0.03;          
                 const coreStarCount = Math.floor(starCount * 0.2);          const armStarCount = Math.floor(starCount * 0.6);           const haloStarCount = starCount - coreStarCount - armStarCount;          
                 for (let j = 0; j < coreStarCount; j++) {
                         const r = Math.pow(Math.random(), 0.5) * galaxyRadius * 0.25;              const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
                         const flattenFactor = galaxyType === 0 ? 0.4 : 0.7;              
            const pos = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta) * flattenFactor,
                r * Math.cos(phi) * flattenFactor
            );
            
                         pos.applyMatrix4(rotation);
            pos.add(galaxyCenter);
            
            vertices.core.push(pos.x, pos.y, pos.z);
        }
        
                 for (let j = 0; j < armStarCount; j++) {
                         const distanceFromCenter = Math.pow(Math.random(), 0.4) * galaxyRadius;
            const angle = Math.random() * Math.PI * 2;
            
                         const armIndex = Math.floor(angle / (Math.PI * 2 / spiralArms));
            const armCenterAngle = armIndex * (Math.PI * 2 / spiralArms);
            const angleFromArmCenter = angle - armCenterAngle;
            const normalizedArmOffset = angleFromArmCenter / (Math.PI * 2 / spiralArms);
            
                         let armFactor = 0;
            if (galaxyType === 0) {                  const armDist = Math.abs(normalizedArmOffset - 0.5) * 2;                  armFactor = Math.pow(Math.max(0, 1 - armDist * 2), 3);              } else {                  const armDist = Math.abs(normalizedArmOffset - 0.5) * 2;
                armFactor = Math.pow(Math.max(0, 1 - armDist), 1.2);              }
            
                         const spiralFactor = Math.pow(distanceFromCenter / galaxyRadius, spiralTightness);
            const spiralAngle = armCenterAngle + spiralFactor * (galaxyType === 0 ? 6 : 3);
            
                         if (Math.random() < armFactor * 0.9 || distanceFromCenter < galaxyRadius * 0.2) {
                                 const heightFactor = 1 - 0.7 * (distanceFromCenter / galaxyRadius);
                const thickness = diskHeight * heightFactor;
                
                                 const randHeight = ((Math.random() + Math.random() + Math.random() + Math.random()) / 4 - 0.5) * 2;
                const height = randHeight * thickness;
                
                                 const x = Math.cos(spiralAngle) * distanceFromCenter;
                const y = height;
                const z = Math.sin(spiralAngle) * distanceFromCenter;
                
                                 const scatter = armWidth * distanceFromCenter * (1 - Math.pow(armFactor, 2) * 0.8);
                const scatterAngle = Math.random() * Math.PI * 2;
                const pos = new THREE.Vector3(
                    x + Math.cos(scatterAngle) * scatter * Math.random(),
                    y,
                    z + Math.sin(scatterAngle) * scatter * Math.random()
                );
                
                                 pos.applyMatrix4(rotation);
                pos.add(galaxyCenter);
                
                vertices.arms.push(pos.x, pos.y, pos.z);
            }
        }
        
                 for (let j = 0; j < haloStarCount; j++) {
                         const r = galaxyRadius * (0.3 + Math.pow(Math.random(), 0.5) * 0.9);              const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
                         const verticalCompression = 0.7;              
            const pos = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta) * verticalCompression,                  r * Math.cos(phi)
            );
            
                         pos.applyMatrix4(rotation);
            pos.add(galaxyCenter);
            
            vertices.halo.push(pos.x, pos.y, pos.z);
        }
    }
    else {                   for (let j = 0; j < starCount; j++) {
                         const component = j < starCount * 0.3 ? 'core' : 
                              (j < starCount * 0.8 ? 'arms' : 'halo');
            
                         const r = Math.pow(Math.random(), 0.7) * galaxyRadius;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
                         let height;
            if (component === 'core') {
                height = (Math.random() - 0.5) * galaxyRadius * 0.2;
            } else if (component === 'arms') {
                height = (Math.random() - 0.5) * galaxyRadius * 0.1;
            } else {
                height = (Math.random() - 0.5) * galaxyRadius * 0.4;
            }
            
                         const irregularity = Math.random() * galaxyRadius * 0.3;
            const irregAngle = Math.random() * Math.PI * 2;
            
            const pos = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta) + Math.cos(irregAngle) * irregularity * (Math.random() > 0.7 ? 1 : 0),
                height,
                r * Math.sin(phi) * Math.sin(theta) + Math.sin(irregAngle) * irregularity * (Math.random() > 0.7 ? 1 : 0)
            );
            
                         pos.applyMatrix4(rotation);
            pos.add(galaxyCenter);
            
            vertices[component].push(pos.x, pos.y, pos.z);
        }
    }
    
         const galaxy = new THREE.Group();
    galaxy.userData = {
        type: 'galaxy',
        baseSize: 1.5 * sizeFactor,
        isRepresentative: Math.random() < 0.3,
        components: [],
        rotationSpeed: galaxyRotationSpeed * (0.5 + Math.random())     };
    
         Object.keys(vertices).forEach(component => {
        if (vertices[component].length > 0) {
            galaxyGeometries[component].setAttribute('position', 
                new THREE.Float32BufferAttribute(vertices[component], 3));
            
            const mesh = new THREE.Points(galaxyGeometries[component], galaxyMaterials[component]);
            mesh.userData = {
                component: component,
                baseSize: galaxyMaterials[component].size,
                starCount: vertices[component].length / 3
            };
            
            galaxy.add(mesh);
            galaxy.userData.components.push(component);
        }
    });
    
    galaxy.position.copy(galaxyCenter);
    scene.add(galaxy);
    
    return galaxy;
}

 function createSolarSystem() {
    const sunTexture = new THREE.TextureLoader().load(planetData.sun.texturePath);
    const sunGeometry = new THREE.SphereGeometry(orbitalData.sun.size, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
        map: sunTexture,
        emissive: 0xffcc00,
        emissiveIntensity: 0.3
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.userData = { planetId: 'sun' };
    scene.add(sun);
    planets.sun = sun;
    
        const sunGlowGeometry = new THREE.SphereGeometry(orbitalData.sun.size + 2, 32, 32);
    const sunGlowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            c: { value: 0.1 },
            p: { value: 4.0 },
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
    sunGlow.userData = { planetId: 'sun' };
    sun.add(sunGlow);
    
        createSunParticles();
    
    Object.keys(orbitalData).forEach(planetId => {
        if (planetId === 'sun') return;
        
                if (orbitalData[planetId].parentPlanet) return;
        
                initialPlanetAngles[planetId] = Math.random() * Math.PI * 2;
        
        const planet = createPlanet(planetId);
        planets[planetId] = planet;
        scene.add(planet);
        
        const orbitLine = createOrbitLine(planetId);
        orbitLines.push(orbitLine);
        scene.add(orbitLine);
    });
    
        Object.keys(orbitalData).forEach(moonId => {
        if (orbitalData[moonId].parentPlanet) {
                        initialMoonAngles[moonId] = Math.random() * Math.PI * 2;
            
            const moon = createMoon(moonId);
            moons[moonId] = moon;
            scene.add(moon);
            
                        const moonOrbitLine = createMoonOrbitLine(moonId);
            orbitLines.push(moonOrbitLine);
            scene.add(moonOrbitLine);
        }
    });
    
    updatePlanetPositions(0);
}

 function createSunParticles() {
        const particleCount = 2500;
    const particles = new THREE.BufferGeometry();
    
        const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
        const colorOptions = [
        new THREE.Color(0xffcc00).multiplyScalar(0.7),         new THREE.Color(0xff8800).multiplyScalar(0.6),         new THREE.Color(0xff4400).multiplyScalar(0.5),         new THREE.Color(0xff2200).multiplyScalar(0.5),         new THREE.Color(0xffffaa).multiplyScalar(0.6)      ];
    
        const sunRadius = orbitalData.sun.size;
    const sunRadiusOuter = sunRadius * 1.2;
    
    for (let i = 0; i < particleCount; i++) {
                const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
                const radius = sunRadius + Math.random() * (sunRadiusOuter - sunRadius);
        
                const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);
        
                positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
                const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
                sizes[i] = Math.random() * 1.5 + 0.3;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
        const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            size: { value: 0.6 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            varying vec3 vColor;
            uniform float time;
            void main() {
                vColor = color;
                
                                vec3 pos = position;
                float displacement = sin(time * 5.0 + position.x * 10.0) * 0.1 +
                                   sin(time * 3.0 + position.y * 8.0) * 0.1 +
                                   sin(time * 4.0 + position.z * 6.0) * 0.1;
                                   
                pos += normalize(pos) * displacement;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * 2.0 * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                                float r = distance(gl_PointCoord, vec2(0.5, 0.5));
                if (r > 0.5) discard;
                
                                float strength = 1.0 - (r / 0.5);
                strength = pow(strength, 2.0);
                
                                gl_FragColor = vec4(vColor, strength);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    });
    
        const sunParticles = new THREE.Points(particles, particleMaterial);
    sunParticles.userData = { 
        planetId: 'sun',
        isSunParticles: true
    };
    
        sun.add(sunParticles);
    
        const updateSunParticles = function(time) {
        if (sunParticles && sunParticles.material) {
            sunParticles.material.uniforms.time.value = time;
            sunParticles.rotation.y += 0.001;
            sunParticles.rotation.z += 0.0005;
            sunParticles.rotation.x += 0.0003;
        }
    };
    
        sun.userData.updateSunParticles = updateSunParticles;
}

 function createPlanet(planetId) {
    const data = orbitalData[planetId];
    
    const texture = new THREE.TextureLoader().load(planetData[planetId].texturePath);
    
        let planetSize;
    if (realScale) {
                                        const sizeRatio = data.realSize / orbitalData.sun.realSize;
        planetSize = orbitalData.sun.size * sizeRatio;
        
                planetSize = Math.max(planetSize, 0.5);
    } else {
                planetSize = data.size;
    }
    
    const geometry = new THREE.SphereGeometry(planetSize, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.1,
        roughness: 0.8
    });
    
    const planet = new THREE.Mesh(geometry, material);
    planet.castShadow = true;
    planet.receiveShadow = true;
    
    planet.userData = { planetId: planetId };
    
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
        
        ring.userData = { planetId: planetId };
        
        planet.add(ring);
    }
    
    return planet;
}

 function createOrbitLine(planetId) {
    const data = orbitalData[planetId];
    
    let orbitMultiplier;
    if (realScale) {
                        orbitMultiplier = 300;     } else {
                if (planetId === 'mercury') {
            orbitMultiplier = 400;
        } else if (planetId === 'venus') {
            orbitMultiplier = 350;
        } else {
            orbitMultiplier = 300;
        }
    }
    
    const orbitRadius = data.orbitRadius * orbitMultiplier;
    
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

 function updatePlanetPositions(deltaTime) {
        smoothTimeSpeed = THREE.MathUtils.lerp(smoothTimeSpeed, targetTimeSpeed, timeSpeedLerpFactor);
    
        accumulatedTime += deltaTime * smoothTimeSpeed;

        Object.keys(planets).forEach(planetId => {
        if (planetId === 'sun') return;
        const planet = planets[planetId];
        const data = orbitalData[planetId];
        
        let orbitMultiplier;
        if (realScale) {
            orbitMultiplier = 300;
        } else {
            if (planetId === 'mercury') {
                orbitMultiplier = 400;
            } else if (planetId === 'venus') {
                orbitMultiplier = 350;
            } else {
                orbitMultiplier = 300;
            }
        }
        
        const orbitRadius = data.orbitRadius * orbitMultiplier;
        
                const angle = (accumulatedTime * data.orbitSpeed) + initialPlanetAngles[planetId];
        
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        
        planet.position.set(x, 0, z);
        
                planet.rotation.y += data.rotationSpeed * smoothTimeSpeed * deltaTime;
    });
    
        Object.keys(moons).forEach(moonId => {
        const moon = moons[moonId];
        const data = orbitalData[moonId];
        const parentPlanetId = data.parentPlanet;
        
        if (planets[parentPlanetId]) {
            const parentPlanet = planets[parentPlanetId];
            
                        const orbitMultiplier = 300;
            const orbitRadius = realScale ? 
                data.realEarthOrbitRadius * orbitMultiplier : 
                data.earthOrbitRadius * orbitMultiplier;
            
                        const moonOrbitSpeed = realScale && data.realOrbitSpeed ? 
                data.realOrbitSpeed : 
                data.orbitSpeed;
            
                        const moonAngle = (accumulatedTime * moonOrbitSpeed) + initialMoonAngles[moonId];
            
                        const relativeX = Math.cos(moonAngle) * orbitRadius;
            const relativeZ = Math.sin(moonAngle) * orbitRadius;
            
                        moon.position.x = parentPlanet.position.x + relativeX;
            moon.position.y = 0;
            moon.position.z = parentPlanet.position.z + relativeZ;
            
                        moon.rotation.y += data.rotationSpeed * smoothTimeSpeed * deltaTime;
            
                        orbitLines.forEach(line => {
                if (line.userData && line.userData.isMoonOrbit && line.userData.moonId === moonId) {
                    line.position.copy(parentPlanet.position);
                }
            });
        }
    });
    
        planets.sun.rotation.y += orbitalData.sun.rotationSpeed * smoothTimeSpeed * deltaTime;
    
    orbitLines.forEach((line) => {
        line.visible = true;
    });
}

 function animate() {
    requestAnimationFrame(animate);
    
    const currentTime = clock.getElapsedTime();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    if (!mainMenuActive) {
        updatePlanetPositions(deltaTime);
        updateGalaxyRotations(deltaTime);
        
        if (sun && sun.userData.updateSunParticles) {
            sun.userData.updateSunParticles(currentTime);
        }
    }
    
    TWEEN.update();
    
    updateLOD(camera.position.length());
    
    smoothTransitionUpdate(deltaTime);
    
    if (cameraFollowing && selectedPlanet && !mainMenuActive) {
        const planetObject = planets[selectedPlanet] || moons[selectedPlanet];
        
        if (planetObject) {
                        cameraTarget.copy(planetObject.position);
            
                                                const speedRatio = smoothTimeSpeed / 600;             const targetLerpFactor = Math.min(0.95, 0.2 + (1 - Math.pow(1 - speedRatio, 3)) * 0.75);
            
            controls.target.lerp(cameraTarget, targetLerpFactor);
            
                        if (!activeCameraTween) {
                const planetId = selectedPlanet;
                let offset;
                let viewDistance;
                const sunPos = new THREE.Vector3(0, 0, 0);
                
                                let currentOrbitRadius = planetObject.position.length();
                
                                if (planetId === 'moon' && moons[planetId]) {
                    const moonObj = moons[planetId];
                    const directionToEarth = new THREE.Vector3().subVectors(planets.earth.position, moonObj.position).normalize();
                    
                                        viewDistance = realScale ? 0.1 : 1.5;
                    
                    offset = new THREE.Vector3().copy(directionToEarth).multiplyScalar(-viewDistance);
                    offset.y = viewDistance * 0.3;
                    
                } else if (planetId === 'sun') {
                                        const data = orbitalData[planetId];
                    const planetSize = realScale ? data.realSize / 10000 : data.size;
                    const zoomFactor = 1.2;
                    viewDistance = planetSize * zoomFactor * 5;
                    
                    offset = new THREE.Vector3(viewDistance * 0.8, viewDistance * 0.6, viewDistance * 0.8);
                    
                } else if (planetId === 'pluto') {
                                        const directionToSun = new THREE.Vector3().subVectors(sunPos, planetObject.position).normalize();
                    viewDistance = realScale ? 0.05 : 5;
                    
                                        if (smoothTimeSpeed > 100) {
                        viewDistance *= 1 + (smoothTimeSpeed - 100) / 100;
                    }
                    
                    offset = new THREE.Vector3().copy(directionToSun).multiplyScalar(-viewDistance);
                    offset.y = viewDistance * 0.3;
                    
                } else {
                                        const data = orbitalData[planetId];
                    let zoomFactor;
                    
                    if (['mercury', 'venus'].includes(planetId)) {
                        zoomFactor = realScale ? 0.1 : 0.4;
                    } else if (['earth', 'mars'].includes(planetId)) {
                        zoomFactor = realScale ? 0.15 : 0.5;
                    } else if (['neptune', 'uranus'].includes(planetId)) {
                        zoomFactor = realScale ? 0.3 : 0.6;
                    } else {                         zoomFactor = realScale ? 0.4 : 0.75;
                    }
                    
                    const planetSize = realScale ? data.realSize / 10000 : data.size;
                    viewDistance = planetSize * zoomFactor * (realScale ? 2 : 10);
                    
                                                            if (smoothTimeSpeed > 10) {
                        const speedFactor = Math.pow(smoothTimeSpeed / 10, 0.7);                         viewDistance *= 1 + speedFactor * 0.2;
                    }
                    
                                        const directionToSun = new THREE.Vector3().subVectors(sunPos, planetObject.position).normalize();
                    offset = new THREE.Vector3().copy(directionToSun).multiplyScalar(-viewDistance * 1.1);
                    offset.y = viewDistance * 0.4;
                }
                
                                const targetCameraPosition = new THREE.Vector3().copy(planetObject.position).add(offset);
                
                                                const posSpeedRatio = smoothTimeSpeed / 600;
                const posLerpFactor = Math.min(0.98, 0.15 + (1 - Math.pow(1 - posSpeedRatio, 2)) * 0.83);
                
                                camera.position.lerp(targetCameraPosition, posLerpFactor);
                
                                                if (planetId !== 'sun') {
                                        const baseSunFactor = 0.1;
                    const speedBasedSunFactor = baseSunFactor + (smoothTimeSpeed / 600) * 0.1;
                    
                    const blendedTarget = new THREE.Vector3().copy(planetObject.position)
                        .lerp(sunPos, speedBasedSunFactor);
                    
                    controls.target.lerp(blendedTarget, 0.05);
                }
            }
            
            controls.update();
        }
    } else {
        controls.update();
    }
    
    renderer.render(scene, camera);
}

 function stopActiveCameraTween() {
    if (activeCameraTween) {
        activeCameraTween.stop();
        activeCameraTween = null;
        
                 controls.enabled = true;
    }
}

 function smoothTransitionUpdate(delta) {
         const transitionSpeed = 1.0;
    
         galaxies.forEach(galaxy => {
        if (!galaxy.userData) return;
        
                 galaxy.children.forEach(child => {
            if (child.material) {
                if (galaxy.visible) {
                                         if (child.material.opacity < child.material.userData?.targetOpacity || 
                        child.material.size < child.material.userData?.targetSize) {
                        
                                                 if (child.material.userData && child.material.userData.targetOpacity !== undefined) {
                            child.material.opacity = THREE.MathUtils.lerp(
                                child.material.opacity,
                                child.material.userData.targetOpacity,
                                delta * 2.0 * transitionSpeed
                            );
                        }
                        
                                                 if (child.material.size !== undefined && 
                            child.material.userData && 
                            child.material.userData.targetSize !== undefined) {
                            
                            child.material.size = THREE.MathUtils.lerp(
                                child.material.size,
                                child.material.userData.targetSize,
                                delta * 2.0 * transitionSpeed
                            );
                        }
                    }
                }
            }
        });
    });
    
         galaxyClusters.forEach(cluster => {
        if (!cluster.material || !cluster.userData) return;
        
        if (cluster.visible) {
                         if (cluster.material.opacity < cluster.userData?.targetOpacity || 
                cluster.material.size < cluster.userData?.targetSize) {
                
                                 if (cluster.userData && cluster.userData.targetOpacity !== undefined) {
                    cluster.material.opacity = THREE.MathUtils.lerp(
                        cluster.material.opacity,
                        cluster.userData.targetOpacity,
                        delta * 2.0 * transitionSpeed
                    );
                }
                
                                 if (cluster.material.size !== undefined && 
                    cluster.userData && 
                    cluster.userData.targetSize !== undefined) {
                    
                    cluster.material.size = THREE.MathUtils.lerp(
                        cluster.material.size,
                        cluster.userData.targetSize,
                        delta * 2.0 * transitionSpeed
                    );
                }
            }
        } else {
                         if (cluster.material.opacity > 0.01) {
                cluster.material.opacity = THREE.MathUtils.lerp(
                    cluster.material.opacity,
                    0,
                    delta * 3.0 * transitionSpeed
                );
                
                                 if (cluster.material.opacity < 0.01) {
                    cluster.material.opacity = 0;
                }
            }
        }
    });
}

 function updateLOD(cameraDistance) {
    const cameraPos = camera.position.clone();
    
         if (cameraDistance > 50000000) {
        if (Math.random() > 0.1) return;      } else if (cameraDistance > 10000000) {
        if (Math.random() > 0.3) return;      }
    
         const planetViewThreshold = 1000;
    const closeThreshold = 100000;
    const mediumThreshold = 1000000;
    const farThreshold = 10000000;
    const extremeThreshold = 50000000;
    const superExtremeThreshold = 200000000;
    
         const layer1TransitionStart = mediumThreshold * 0.7;      const layer2TransitionStart = farThreshold * 0.7;      const layer3TransitionStart = extremeThreshold * 0.7;      
    const clusterLayer1TransitionStart = mediumThreshold * 0.7;      const clusterLayer2TransitionStart = farThreshold * 0.7;      const clusterLayer3TransitionStart = extremeThreshold * 0.7;      
         const isPlanetView = cameraDistance < planetViewThreshold;
    const isCloseGalaxyView = cameraDistance < closeThreshold;
    const isMediumView = cameraDistance < mediumThreshold;
    const isFarView = cameraDistance < farThreshold;
    const isExtremeView = cameraDistance < extremeThreshold;
    const isSuperExtremeView = cameraDistance < superExtremeThreshold;
    
         galaxies.forEach(galaxy => {
        if (galaxy.userData && galaxy.userData.visibilityLayer === 1) {
            const distanceToCamera = cameraPos.distanceTo(galaxy.position);
            
                         const isInRange = distanceToCamera < viewingSettings.starVisibilityDistance * 1000000;
            
                         let transitionFactor = 1.0;
            if (cameraDistance > layer1TransitionStart && cameraDistance < mediumThreshold) {
                                 transitionFactor = 1.0 - (cameraDistance - layer1TransitionStart) / (mediumThreshold - layer1TransitionStart);
            } else if (cameraDistance >= mediumThreshold) {
                transitionFactor = 0;              }
            
                         galaxy.visible = isInRange && transitionFactor > 0;
            
                         if (galaxy.visible) {
                galaxy.children.forEach(child => {
                    if (child.material) {
                                                 const distanceFactor = Math.min(1, viewingSettings.starVisibilityDistance * 1000000 / distanceToCamera);
                                                 child.material.userData = child.material.userData || {};
                        child.material.userData.targetOpacity = Math.min(0.7, 0.4 + distanceFactor * 0.3) * transitionFactor;
                        
                                                 if (child.material.size !== undefined) {
                            const baseSize = child.userData ? child.userData.baseSize || 1.0 : 1.0;
                            child.material.userData.targetSize = baseSize * (0.7 + transitionFactor * 0.3);
                        }
                    }
                });
            }
        }
    });
    
         galaxies.forEach(galaxy => {
        if (galaxy.userData && galaxy.userData.visibilityLayer === 2) {
            const distanceToCamera = cameraPos.distanceTo(galaxy.position);
            
                         const isInRange = distanceToCamera < viewingSettings.galaxyVisibilityDistance * 1000000;
            
                         let fadeInFactor = 0;
            if (cameraDistance > closeThreshold && cameraDistance < mediumThreshold) {
                                 fadeInFactor = (cameraDistance - closeThreshold) / (mediumThreshold - closeThreshold);
            } else if (cameraDistance >= mediumThreshold && cameraDistance < layer2TransitionStart) {
                fadeInFactor = 1.0;              } else if (cameraDistance >= layer2TransitionStart && cameraDistance < farThreshold) {
                                 fadeInFactor = 1.0 - (cameraDistance - layer2TransitionStart) / (farThreshold - layer2TransitionStart);
            }
            
                         galaxy.visible = isInRange && fadeInFactor > 0;
            
                         if (galaxy.visible) {
                galaxy.children.forEach(child => {
                    if (child.material) {
                                                 const distanceFactor = Math.min(1, viewingSettings.galaxyVisibilityDistance * 1000000 / distanceToCamera);
                                                 child.material.userData = child.material.userData || {};
                        child.material.userData.targetOpacity = Math.min(0.6, 0.3 + distanceFactor * 0.3) * fadeInFactor;
                        
                                                 if (child.material.size !== undefined) {
                            const baseSize = child.userData ? child.userData.baseSize || 1.0 : 1.0;
                            child.material.userData.targetSize = baseSize * (0.7 + fadeInFactor * 0.3);
                        }
                    }
                });
            }
        }
    });
    
         galaxies.forEach(galaxy => {
        if (galaxy.userData && galaxy.userData.visibilityLayer === 3) {
            const distanceToCamera = cameraPos.distanceTo(galaxy.position);
            
                         const isInRange = distanceToCamera < viewingSettings.galaxyVisibilityDistance * 1000000;
            
                         let fadeInFactor = 0;
            if (cameraDistance > mediumThreshold && cameraDistance < farThreshold) {
                                 fadeInFactor = (cameraDistance - mediumThreshold) / (farThreshold - mediumThreshold);
            } else if (cameraDistance >= farThreshold && cameraDistance < layer3TransitionStart) {
                fadeInFactor = 1.0;              } else if (cameraDistance >= layer3TransitionStart && cameraDistance < extremeThreshold) {
                                 fadeInFactor = 1.0 - (cameraDistance - layer3TransitionStart) / (extremeThreshold - layer3TransitionStart);
            }
            
                         galaxy.visible = isInRange && fadeInFactor > 0;
            
                         if (galaxy.visible) {
                galaxy.children.forEach(child => {
                    if (child.material) {
                                                 const distanceFactor = Math.min(1, viewingSettings.galaxyVisibilityDistance * 1000000 / distanceToCamera);
                                                 child.material.userData = child.material.userData || {};
                        child.material.userData.targetOpacity = Math.min(0.5, 0.2 + distanceFactor * 0.3) * fadeInFactor;
                        
                                                 if (child.material.size !== undefined) {
                            const baseSize = child.userData ? child.userData.baseSize || 1.0 : 1.0;
                            child.material.userData.targetSize = baseSize * (0.7 + fadeInFactor * 0.3);
                        }
                    }
                });
            }
        }
    });
    
         galaxyClusters.forEach(cluster => {
        if (cluster.userData && cluster.userData.visibilityLayer === 1) {
                         let fadeInFactor = 0;
            if (cameraDistance > clusterLayer1TransitionStart && cameraDistance < mediumThreshold) {
                                 fadeInFactor = (cameraDistance - clusterLayer1TransitionStart) / (mediumThreshold - clusterLayer1TransitionStart);
            } else if (cameraDistance >= mediumThreshold && cameraDistance < extremeThreshold * 0.7) {
                fadeInFactor = 1.0;              } else if (cameraDistance >= extremeThreshold * 0.7 && cameraDistance < extremeThreshold) {
                                 fadeInFactor = 1.0 - (cameraDistance - extremeThreshold * 0.7) / (extremeThreshold * 0.3);
            }
            
                         const distanceToCamera = cameraPos.distanceTo(cluster.position);
            const isInRange = distanceToCamera < viewingSettings.clusterVisibilityDistance * 1000000;
            
                         cluster.visible = isInRange && fadeInFactor > 0;
            
            if (cluster.visible && cluster.material) {
                                 const visibilityFactor = Math.min(1, viewingSettings.clusterVisibilityDistance * 1000000 / distanceToCamera);
                
                                 cluster.userData.targetSize = cluster.userData.baseSize * (0.5 + visibilityFactor * 0.5) * (0.8 + fadeInFactor * 0.2);
                cluster.userData.targetOpacity = Math.min(0.7, 0.4 + visibilityFactor * 0.3) * fadeInFactor;
            }
        }
    });
    
         galaxyClusters.forEach(cluster => {
        if (cluster.userData && cluster.userData.visibilityLayer === 2) {
                         let fadeInFactor = 0;
            if (cameraDistance > clusterLayer2TransitionStart && cameraDistance < farThreshold) {
                                 fadeInFactor = (cameraDistance - clusterLayer2TransitionStart) / (farThreshold - clusterLayer2TransitionStart);
            } else if (cameraDistance >= farThreshold && cameraDistance < superExtremeThreshold * 0.7) {
                fadeInFactor = 1.0;              } else if (cameraDistance >= superExtremeThreshold * 0.7 && cameraDistance < superExtremeThreshold) {
                                 fadeInFactor = 1.0 - (cameraDistance - superExtremeThreshold * 0.7) / (superExtremeThreshold * 0.3);
            }
            
                         const distanceToCamera = cameraPos.distanceTo(cluster.position);
            const isInRange = distanceToCamera < viewingSettings.clusterVisibilityDistance * 1000000;
            
                         cluster.visible = isInRange && fadeInFactor > 0;
            
            if (cluster.visible && cluster.material) {
                                 const visibilityFactor = Math.min(1, viewingSettings.clusterVisibilityDistance * 1000000 / distanceToCamera);
                
                                 cluster.userData.targetSize = cluster.userData.baseSize * (0.5 + visibilityFactor * 0.5) * (0.8 + fadeInFactor * 0.2);
                cluster.userData.targetOpacity = Math.min(0.6, 0.3 + visibilityFactor * 0.3) * fadeInFactor;
            }
        }
    });
    
         galaxyClusters.forEach(cluster => {
        if (cluster.userData && cluster.userData.visibilityLayer === 3) {
                         let fadeInFactor = 0;
            if (cameraDistance > clusterLayer3TransitionStart && cameraDistance < extremeThreshold) {
                                 fadeInFactor = (cameraDistance - clusterLayer3TransitionStart) / (extremeThreshold - clusterLayer3TransitionStart);
            } else if (cameraDistance >= extremeThreshold) {
                fadeInFactor = 1.0;              }
            
                         const distanceToCamera = cameraPos.distanceTo(cluster.position);
            const isInRange = distanceToCamera < viewingSettings.superClusterVisibilityDistance * 1000000;
            
                         cluster.visible = isInRange && fadeInFactor > 0;
            
            if (cluster.visible && cluster.material) {
                                 const visibilityFactor = Math.min(1, viewingSettings.superClusterVisibilityDistance * 1000000 / distanceToCamera);
                
                                 cluster.userData.targetSize = cluster.userData.baseSize * (0.5 + visibilityFactor * 0.5) * (0.8 + fadeInFactor * 0.2);
                cluster.userData.targetOpacity = Math.min(0.5, 0.2 + visibilityFactor * 0.3) * fadeInFactor;
            }
        }
    });
}

 function createEventListeners() {
         document.getElementById('toggle-ui').addEventListener('click', toggleUI);
    document.getElementById('toggle-scale').addEventListener('click', toggleScale);
    document.getElementById('reset-system').addEventListener('click', resetView);
    document.getElementById('real-time').addEventListener('click', setRealTime);
    document.getElementById('time-speed').addEventListener('input', updateTimeSpeed);
    
    document.getElementById('settings-button').addEventListener('click', openSettings);
    document.getElementById('about-button').addEventListener('click', showAboutInfo);
    
    document.getElementById('menu-button').addEventListener('click', togglePlanetMenu);
    document.querySelector('#planet-info .close-button').addEventListener('click', closePlanetInfo);
    document.querySelector('#settings-panel .close-button').addEventListener('click', closeSettings);
    document.querySelector('#about-panel .close-button').addEventListener('click', closeAboutInfo);
    
         document.getElementById('start-expedition').addEventListener('click', startExpedition);
    
         document.querySelector('#settings-panel .close-button').addEventListener('click', closeSettings);
    document.getElementById('save-settings').addEventListener('click', saveSettings);

        document.getElementById('reset-system-menu').addEventListener('click', function() {
        resetSystem();
    });
    
         document.getElementById('quality-select').addEventListener('change', updateQuality);
    document.getElementById('stars-density').addEventListener('input', updateStarsDensity);
    document.getElementById('rotation-speed').addEventListener('input', updateRotationSpeed);
    document.getElementById('zoom-speed').addEventListener('input', updateZoomSpeed);
    document.getElementById('orbit-lines').addEventListener('change', updateOrbitLines);
    document.getElementById('planet-labels').addEventListener('change', updatePlanetLabels);
    
         document.getElementById('max-zoom-distance').addEventListener('input', function(e) {
        document.getElementById('zoom-value').textContent = e.target.value + 'M';
    });
    
         document.getElementById('star-visibility').addEventListener('input', function(e) {
        document.getElementById('star-visibility-value').textContent = e.target.value + 'M';
    });
    
    document.getElementById('galaxy-visibility').addEventListener('input', function(e) {
        document.getElementById('visibility-value').textContent = e.target.value + 'M';
    });
    
    document.getElementById('cluster-visibility').addEventListener('input', function(e) {
        document.getElementById('cluster-visibility-value').textContent = e.target.value + 'M';
    });
    
    document.getElementById('supercluster-visibility').addEventListener('input', function(e) {
        document.getElementById('supercluster-visibility-value').textContent = e.target.value + 'M';
    });
    
    document.getElementById('color-saturation').addEventListener('input', function(e) {
        document.getElementById('saturation-value').textContent = Math.round(e.target.value * 100) + '%';
    });
    
    document.getElementById('star-brightness').addEventListener('input', function(e) {
        document.getElementById('brightness-value').textContent = Math.round(e.target.value * 100) + '%';
    });
    
         document.getElementById('reset-system').addEventListener('click', resetView);
    
         document.getElementById('toggle-ui').addEventListener('click', toggleUI);
    
         document.getElementById('toggle-scale').addEventListener('click', toggleScale);
    
         document.getElementById('real-time').addEventListener('click', setRealTime);
    
         document.getElementById('time-speed').addEventListener('input', updateTimeSpeed);
    
         document.getElementById('menu-button').addEventListener('click', togglePlanetMenu);
    
         document.querySelector('#planet-info .close-button').addEventListener('click', closePlanetInfo);
    
         document.querySelectorAll('#planet-menu li').forEach(item => {
        item.addEventListener('click', () => {
            const planetId = item.getAttribute('data-planet');
            selectPlanet(planetId);
        });
    });
    
         document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const tab = e.target.getAttribute('data-tab');
            selectTab(tab);
        });
    });
    
         renderer.domElement.addEventListener('click', onSceneClick);
    
         renderer.domElement.addEventListener('mousedown', stopActiveCameraTween);
    
         window.addEventListener('keydown', onKeyDown);
    
         window.addEventListener('resize', onWindowResize);
    
    document.getElementById('cosmic-web-visibility').addEventListener('change', function(e) {
        viewingSettings.cosmicWebVisibility = e.target.checked;
        updateGalaxyVisibility();
    });
    
    document.getElementById('auto-hide-distant').addEventListener('change', function(e) {
        viewingSettings.autoHideDistantObjects = e.target.checked;
        updateGalaxyVisibility();
    });
    
         document.getElementById('show-stars').addEventListener('change', function(e) {
        viewingSettings.showStars = e.target.checked;
        updateVisibilitySettings();
    });
    
    document.getElementById('show-galaxies').addEventListener('change', function(e) {
        viewingSettings.showGalaxies = e.target.checked;
        updateVisibilitySettings();
    });
    
    document.getElementById('show-superclusters').addEventListener('change', function(e) {
        viewingSettings.showSuperClusters = e.target.checked;
        updateVisibilitySettings();
    });
    
    document.getElementById('only-home-galaxy').addEventListener('change', function(e) {
        viewingSettings.onlyHomeGalaxy = e.target.checked;
        updateVisibilitySettings();
    });

        const timeSpeedSlider = document.getElementById('time-speed');
    
        timeSpeedSlider.addEventListener('input', (e) => {
        document.getElementById('speed-value').textContent = e.target.value + 'x';
    });

        timeSpeedSlider.addEventListener('change', updateTimeSpeed);
}

 function onSceneClick(event) {
         if (mainMenuActive) return;
    
         const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
         const raycaster = new THREE.Raycaster();
         raycaster.params.Points.threshold = 0.1;
    raycaster.params.Line.threshold = 0.1;
    raycaster.setFromCamera(mouse, camera);
    
         stopActiveCameraTween();
    
         const planetObjects = Object.values(planets);
    let intersects = raycaster.intersectObjects(planetObjects, true);
    
         if (intersects.length === 0) {
        intersects = raycaster.intersectObjects(scene.children, true);
    }
    
         if (intersects.length > 0) {
                 let intersectedObject = intersects[0].object;
        let planetId = null;
        
                 if (intersectedObject.userData && intersectedObject.userData.planetId) {
            planetId = intersectedObject.userData.planetId;
        } else {
                         let parent = intersectedObject.parent;
            while (parent && !planetId) {
                if (parent.userData && parent.userData.planetId) {
                    planetId = parent.userData.planetId;
                }
                parent = parent.parent;
            }
        }
        
                 if (planetId) {
            selectPlanet(planetId);
        }
    }
}

 function selectPlanet(planetId) {
    selectedPlanet = planetId;
    cameraFollowing = true;
    
    document.querySelectorAll('#planet-menu li').forEach(item => {
        if (item.getAttribute('data-planet') === planetId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    updatePlanetInfo(planetId);
    
    document.getElementById('planet-info').classList.add('active');
    
    controls.maxDistance = 10000;
    
        if (planetId === 'moon' && moons[planetId]) {
        stopActiveCameraTween();
        
        const moon = moons[planetId];
        const data = orbitalData[planetId];
        
        const targetPosition = new THREE.Vector3().copy(moon.position);
        
                        const distance = realScale ? 0.3 : 1.5;
        
                const directionToEarth = new THREE.Vector3().subVectors(planets.earth.position, targetPosition).normalize();
        const offset = new THREE.Vector3().copy(directionToEarth).multiplyScalar(-distance);
        offset.y = distance * 0.3;
        
        const newPosition = new THREE.Vector3().copy(targetPosition).add(offset);
        
        const initialPosition = camera.position.clone();
        
        controls.enabled = false;
        
        controls.target.copy(targetPosition);
        
        activeCameraTween = new TWEEN.Tween(camera.position)
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
                cameraTarget.copy(targetPosition);
                
                controls.enabled = true;
                
                activeCameraTween = null;
            })
            .start();         
        return;
    }
    
    if (planets[planetId]) {
        stopActiveCameraTween();
        
        const planet = planets[planetId];
        const data = orbitalData[planetId];
        
        if (planetId === 'pluto') {
            const originalScale = planet.scale.x;
            planet.scale.set(2.5, 2.5, 2.5);
            
            const targetPosition = new THREE.Vector3().copy(planet.position);
            const distance = 5;
            
            const directionToSun = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), targetPosition).normalize();
            const offset = new THREE.Vector3().copy(directionToSun).multiplyScalar(-distance);
            offset.y = distance * 0.3;
            
            const newPosition = new THREE.Vector3().copy(targetPosition).add(offset);
            
            const initialPosition = camera.position.clone();
            
            controls.enabled = false;
            
            controls.target.copy(targetPosition);
            
            activeCameraTween = new TWEEN.Tween(camera.position)
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
                    cameraTarget.copy(targetPosition);
                    
                    controls.enabled = true;
                    
                    activeCameraTween = null;
                })
                .start();
            
            return;
        }
        
        let zoomFactor;
        if (planetId === 'sun') {
            zoomFactor = 1.2;
        } else if (['mercury', 'venus'].includes(planetId)) {
            zoomFactor = 0.4;
        } else if (['earth', 'mars'].includes(planetId)) {
            zoomFactor = 0.5;
        } else if (['neptune', 'uranus'].includes(planetId)) {
            zoomFactor = 0.6;
        } else {
            zoomFactor = 0.75;
        }
        
        const planetSize = realScale ? data.realSize / 10000 : data.size;
        
        const distance = planetSize * zoomFactor * (planetId === 'sun' ? 5 : 10);
        
        const targetPosition = new THREE.Vector3().copy(planet.position);
        
        const directionToSun = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), targetPosition).normalize();
        
        let offset;
        
        if (planetId === 'sun') {
            offset = new THREE.Vector3(distance * 0.8, distance * 0.6, distance * 0.8);
        } else {
            offset = new THREE.Vector3().copy(directionToSun).multiplyScalar(-distance * 1.1);
            offset.y = distance * 0.4;
        }
        
        const newPosition = new THREE.Vector3().copy(targetPosition).add(offset);
        
        const initialPosition = camera.position.clone();
        
        controls.enabled = false;
        
        controls.target.copy(targetPosition);
        
        activeCameraTween = new TWEEN.Tween(camera.position)
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
                cameraTarget.copy(targetPosition);
                
                controls.enabled = true;
                
                activeCameraTween = null;
            })
            .start();
    }
}

 function updatePlanetInfo(planetId) {
    const planet = planetData[planetId];
    
    document.getElementById('planet-name').textContent = planet.name;
    
         selectTab('overview');
}

 function selectTab(tabName) {
         document.querySelectorAll('.tab-button').forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
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
    
         tabContent.classList.remove('fade-in');
    void tabContent.offsetWidth;      tabContent.classList.add('fade-in');
}

 function toggleUI() {
    const button = document.getElementById('toggle-ui');
    const uiContainer = document.getElementById('ui-container');
    
    document.body.classList.toggle('hidden-ui');
    uiHidden = document.body.classList.contains('hidden-ui');
    
    if (uiHidden) {
        button.textContent = 'Show UI';
        uiContainer.style.animation = 'slideOutUp 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards';          
                 setTimeout(() => {
            if (uiHidden) {
                uiContainer.style.visibility = 'hidden';
            }
        }, 500);
    } else {
        button.textContent = 'Hide UI';
        uiContainer.style.visibility = 'visible';
        uiContainer.style.animation = 'slideInDown 0.3s cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards';      }
}

 function toggleScale() {
    realScale = !realScale;
    
    const button = document.getElementById('toggle-scale');
    button.textContent = realScale ? 'Toggle Visual Scale' : 'Toggle Real Scale';
    
        let sunSize;
    if (realScale) {
        sunSize = orbitalData.sun.size;     } else {
        sunSize = orbitalData.sun.size;
    }
    planets.sun.scale.set(1, 1, 1);
    planets.sun.geometry = new THREE.SphereGeometry(sunSize, 64, 64);
    
        planets.sun.children.forEach(child => {
        if (child.material && child.material.type === 'ShaderMaterial') {
                        child.geometry = new THREE.SphereGeometry(sunSize + 2, 32, 32);
        }
    });
    
        Object.keys(planets).forEach(planetId => {
        if (planetId === 'sun') return;
        const planet = planets[planetId];
        const data = orbitalData[planetId];
        
                let planetSize;
        if (realScale) {
                        const sizeRatio = data.realSize / orbitalData.sun.realSize;
            planetSize = orbitalData.sun.size * sizeRatio;
            
                        planetSize = Math.max(planetSize, 0.5);
        } else {
                        planetSize = data.size;
        }
        
                planet.geometry = new THREE.SphereGeometry(planetSize, 32, 32);
        
                if (planetId === 'saturn') {
            planet.children.forEach(child => {
                if (child.type === 'Mesh' && child.geometry.type === 'RingGeometry') {
                    child.geometry = new THREE.RingGeometry(
                        planetSize * 1.3,
                        planetSize * 2.0,
                        64
                    );
                }
            });
        }
        
                const orbitIndex = Object.keys(orbitalData).indexOf(planetId) - 1;
        if (orbitIndex >= 0 && orbitLines[orbitIndex]) {
            scene.remove(orbitLines[orbitIndex]);
            orbitLines[orbitIndex] = createOrbitLine(planetId);
            scene.add(orbitLines[orbitIndex]);
        }
    });
    
        Object.keys(moons).forEach(moonId => {
        const moon = moons[moonId];
        const data = orbitalData[moonId];
        
                let moonSize;
        if (realScale) {
            const sizeRatio = data.realSize / orbitalData.sun.realSize;
            moonSize = orbitalData.sun.size * sizeRatio;
            
                        if (moonId === 'moon') {
                                const earthSizeRatio = orbitalData.earth.realSize / orbitalData.sun.realSize;
                const earthSize = orbitalData.sun.size * earthSizeRatio;
                moonSize = earthSize * 0.27;
            }
            
            moonSize = Math.max(moonSize, 0.15);
        } else {
            moonSize = data.size;
        }
        
                moon.geometry = new THREE.SphereGeometry(moonSize, 32, 32);
        
                orbitLines.forEach((line, index) => {
            if (line.userData && line.userData.isMoonOrbit && line.userData.moonId === moonId) {
                scene.remove(line);
                orbitLines[index] = createMoonOrbitLine(moonId);
                scene.add(orbitLines[index]);
            }
        });
    });
    
        controls.maxDistance = realScale ? defaultMaxDistance : defaultMaxDistance / 2;
    
        if (selectedPlanet) {
        selectPlanet(selectedPlanet);
    }
}

 function setRealTime() {
        targetTimeSpeed = 0.01;
    
        document.getElementById('time-speed').value = targetTimeSpeed;
    document.getElementById('speed-value').textContent = targetTimeSpeed + 'x';
}

 function updateTimeSpeed(e) {
        const rawValue = parseFloat(e.target.value);
    const roundedValue = Math.round(rawValue * 10) / 10;
    
        document.getElementById('speed-value').textContent = roundedValue.toFixed(1) + 'x';
    
        if (rawValue !== roundedValue) {
        e.target.value = roundedValue;
    }
    
        targetTimeSpeed = roundedValue;
}

 function togglePlanetMenu() {
    const menuButton = document.getElementById('menu-button');
    const planetMenu = document.getElementById('planet-menu');
    
    menuButton.classList.toggle('active');
    planetMenu.classList.toggle('active');
}

 function closePlanetInfo() {
    document.getElementById('planet-info').classList.remove('active');
    cameraFollowing = false;
    
         if (selectedPlanet === 'pluto') {
        planets.pluto.scale.set(0.3, 0.3, 0.3);      }
    
    selectedPlanet = null;
    
         controls.maxDistance = defaultMaxDistance;
    
         stopActiveCameraTween();
    
         const targetPosition = new THREE.Vector3(0, 0, 0);
    
         controls.target.copy(targetPosition);
    
         controls.enabled = false;
    
         activeCameraTween = new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 150, z: 400 }, 1500)           .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(() => {
            camera.lookAt(targetPosition);
        })
        .onComplete(() => {
                         controls.enabled = true;
            activeCameraTween = null;
        })
        .start();
}

 function startExpedition() {
    const mainMenu = document.getElementById('main-menu');
    mainMenu.classList.add('hidden');
    mainMenuActive = false;
    
    document.getElementById('toggle-ui-container').style.display = 'block';
    
    const uiContainer = document.getElementById('ui-container');
    document.body.classList.remove('hidden-ui');
    document.getElementById('toggle-ui').textContent = 'Hide UI';
    
    uiContainer.style.visibility = 'visible';
    uiContainer.style.opacity = '1';
    uiContainer.style.animation = 'slideInDown 0.3s forwards';
    uiHidden = false;
    
        startTime = clock.getElapsedTime();
    lastFrameTime = startTime;
    accumulatedTime = 0;
    smoothTimeSpeed = timeSpeed;
    targetTimeSpeed = timeSpeed;
    
    stopActiveCameraTween();
    
    const targetPosition = new THREE.Vector3(0, 0, 0);
    
    controls.target.copy(targetPosition);
    
    controls.enabled = false;
    
    activeCameraTween = new TWEEN.Tween(camera.position)
    .to({ x: 0, y: 150, z: 400 }, 4000)           .easing(TWEEN.Easing.Exponential.InOut)
    .onUpdate(() => {
        camera.lookAt(targetPosition);
    })
    .onComplete(() => {
                         controls.enabled = true;
        
                         activeCameraTween = new TWEEN.Tween(camera.position)
                .to({
                    x: Math.sin(Math.PI * 0.1) * 400,                       z: Math.cos(Math.PI * 0.1) * 400                    }, 2000)
                .easing(TWEEN.Easing.Sinusoidal.InOut)
                .onUpdate(() => {
                    camera.lookAt(targetPosition);
                })
                .onComplete(() => {
                    activeCameraTween = null;
                })
                .start();
        })
        .start();
}

 function showAboutInfo() {
    const panel = document.getElementById('about-panel');
    
        panel.style.left = '';
    panel.style.top = '';
    panel.style.transform = 'translate(-50%, -50%) scale(0.95)';
    
        panel.removeAttribute('style');
    
        panel.style.transform = 'translate(-50%, -50%) scale(0.95)';
    panel.style.zIndex = '1000';
    
        panel.classList.remove('hidden');
    panel.classList.add('active');
}

 function closeAboutInfo() {
    const panel = document.getElementById('about-panel');
    panel.classList.remove('active');
    panel.classList.add('hidden');
}

 function resetView() {
         cameraFollowing = false;
    
         if (selectedPlanet) {
                 if (selectedPlanet === 'pluto') {
            planets.pluto.scale.set(1, 1, 1);          }
        
                 document.getElementById('planet-info').classList.remove('active');
        selectedPlanet = null;
    }
    
         controls.maxDistance = defaultMaxDistance;
    
         stopActiveCameraTween();
    
         const targetPosition = new THREE.Vector3(0, 0, 0);
    
         controls.target.copy(targetPosition);
    
         controls.enabled = false;
    
         activeCameraTween = new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 150, z: 400 }, 2000)           .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            camera.lookAt(targetPosition);
        })
        .onComplete(() => {
                         controls.enabled = true;
            activeCameraTween = null;
        })
        .start();
}

 function onKeyDown(event) {
         if (['Escape', 'h', 's', 'm', 'r'].includes(event.key)) {
        stopActiveCameraTween();
    }
    
    if (event.key === 'Escape') {
        if (mainMenuActive) {
            return;
        }
        
        if (document.getElementById('settings-panel').classList.contains('hidden') === false) {
            closeSettings();
        } else if (document.getElementById('about-panel').classList.contains('hidden') === false) {
            closeAboutInfo();
        } else if (document.getElementById('planet-info').classList.contains('active')) {
            closePlanetInfo();
        } else {
                         const mainMenu = document.getElementById('main-menu');
            mainMenu.classList.toggle('hidden');
            mainMenuActive = !mainMenu.classList.contains('hidden');
            
                         const toggleUIContainer = document.getElementById('toggle-ui-container');
            const uiContainer = document.getElementById('ui-container');

            if (mainMenuActive) {
                                 document.body.classList.add('hidden-ui');
                uiHidden = true;
                toggleUIContainer.style.display = 'none';
                
                                 uiContainer.style.animation = 'none';
                uiContainer.style.transform = 'translateY(-100%)';
                uiContainer.style.opacity = '0';
                uiContainer.style.visibility = 'hidden';
            } else {
                                 toggleUIContainer.style.display = 'block';
                
                                 document.body.classList.remove('hidden-ui');
                document.getElementById('toggle-ui').textContent = 'Hide UI';
                uiHidden = false;
                
                                 uiContainer.style.visibility = 'visible';
                uiContainer.style.opacity = '1';
                
                                 uiContainer.style.animation = 'slideInDown 0.3s forwards';
            }
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

 function openSettings() {
    const panel = document.getElementById('settings-panel');
    
        panel.style.left = '';
    panel.style.top = '';
    panel.style.transform = 'translate(-50%, -50%) scale(0.95)';
    
        panel.removeAttribute('style');
    
        panel.style.transform = 'translate(-50%, -50%) scale(0.95)';
    panel.style.zIndex = '1000';
    
        panel.classList.remove('hidden');
    panel.classList.add('active');
    
        const qualitySelect = document.getElementById('quality-select');
    
    switch(settings.graphicsQuality) {
        case 1:
            qualitySelect.value = 'low';
            break;
        case 2:
            qualitySelect.value = 'medium';
            break;
        case 3:
            qualitySelect.value = 'high';
            break;
    }
    
    document.getElementById('stars-density').value = viewingSettings.starsDensity || 10000;
    
    document.getElementById('rotation-speed').value = controls.rotateSpeed;
    document.getElementById('zoom-speed').value = controls.zoomSpeed;
    
    document.getElementById('orbit-lines').checked = settings.showOrbitLines;
    document.getElementById('planet-labels').checked = settings.showPlanetLabels;

         document.getElementById('max-zoom-distance').value = viewingSettings.maxZoomDistance;
    document.getElementById('zoom-value').textContent = viewingSettings.maxZoomDistance + 'M';
    
         if (document.getElementById('star-visibility')) {
        document.getElementById('star-visibility').value = viewingSettings.starVisibilityDistance;
        document.getElementById('star-visibility-value').textContent = viewingSettings.starVisibilityDistance + 'M';
    }
    
    document.getElementById('galaxy-visibility').value = viewingSettings.galaxyVisibilityDistance;
    document.getElementById('visibility-value').textContent = viewingSettings.galaxyVisibilityDistance + 'M';
    
    document.getElementById('color-saturation').value = viewingSettings.galaxySaturation;
    document.getElementById('saturation-value').textContent = Math.round(viewingSettings.galaxySaturation * 100) + '%';
    
    document.getElementById('star-brightness').value = viewingSettings.starBrightness;
    document.getElementById('brightness-value').textContent = Math.round(viewingSettings.starBrightness * 100) + '%';
    
         document.getElementById('cosmic-web-visibility').checked = viewingSettings.cosmicWebVisibility;
    document.getElementById('auto-hide-distant').checked = viewingSettings.autoHideDistantObjects;
    document.getElementById('show-stars').checked = viewingSettings.showStars;
    document.getElementById('show-galaxies').checked = viewingSettings.showGalaxies;
    document.getElementById('show-superclusters').checked = viewingSettings.showSuperClusters;
    document.getElementById('only-home-galaxy').checked = viewingSettings.onlyHomeGalaxy;
}

 function closeSettings() {
    const panel = document.getElementById('settings-panel');
    panel.classList.remove('active');
    panel.classList.add('hidden');
}

 function saveSettings() {
         updateQuality();
    updateStarsDensity();
    updateRotationSpeed();
    updateZoomSpeed();
    updateOrbitLines();
    updatePlanetLabels();
    
         updateViewingSettings();
    
         updateVisibilitySettings();
    
         closeSettings();
}

 function makePanelsDraggable() {
    const panels = ['settings-panel', 'about-panel'];
    
    panels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (!panel) return;         
        const header = panel.querySelector('.panel-header');
        if (!header) return;         
        let isDragging = false;
        let offsetX, offsetY;
        
        header.addEventListener('mousedown', function(e) {
            if (e.target !== header && e.target.tagName !== 'H2') return;
            
            isDragging = true;
            
                        const rect = panel.getBoundingClientRect();
            
                        offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
                                    if (panel.style.transform && panel.style.transform.includes('translate')) {
                panel.style.left = `${rect.left}px`;
                panel.style.top = `${rect.top}px`;
                panel.style.transform = 'none';
            }
            
                        panel.style.zIndex = '1001';
            panel.classList.add('dragging');
            
                        e.preventDefault();
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            
            panel.style.left = `${x}px`;
            panel.style.top = `${y}px`;
        });
        
        document.addEventListener('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                panel.classList.remove('dragging');
            }
        });
        
                header.addEventListener('touchstart', function(e) {
            if (e.target !== header && e.target.tagName !== 'H2') return;
            
            isDragging = true;
            
                        const rect = panel.getBoundingClientRect();
            
                        const touch = e.touches[0];
            offsetX = touch.clientX - rect.left;
            offsetY = touch.clientY - rect.top;
            
                                    if (panel.style.transform && panel.style.transform.includes('translate')) {
                panel.style.left = `${rect.left}px`;
                panel.style.top = `${rect.top}px`;
                panel.style.transform = 'none';
            }
            
                        panel.style.zIndex = '1001';
            panel.classList.add('dragging');
            
                        e.preventDefault();
        });
        
        document.addEventListener('touchmove', function(e) {
            if (!isDragging) return;
            
            const touch = e.touches[0];
            const x = touch.clientX - offsetX;
            const y = touch.clientY - offsetY;
            
            panel.style.left = `${x}px`;
            panel.style.top = `${y}px`;
            
            e.preventDefault();
        }, { passive: false });
        
        document.addEventListener('touchend', function() {
            if (isDragging) {
                isDragging = false;
                panel.classList.remove('dragging');
            }
        });
    });
}

 function updateViewingSettings() {
    const maxZoomDistance = document.getElementById('max-zoom-distance');
    const galaxyVisibility = document.getElementById('galaxy-visibility');
    const colorSaturation = document.getElementById('color-saturation');
    const starBrightness = document.getElementById('star-brightness');
    
         document.getElementById('zoom-value').textContent = maxZoomDistance.value + 'M';
    document.getElementById('visibility-value').textContent = galaxyVisibility.value + 'M';
    document.getElementById('saturation-value').textContent = Math.round(colorSaturation.value * 100) + '%';
    document.getElementById('brightness-value').textContent = Math.round(starBrightness.value * 100) + '%';
    
         viewingSettings.maxZoomDistance = parseInt(maxZoomDistance.value);
    viewingSettings.galaxyVisibilityDistance = parseInt(galaxyVisibility.value);
    viewingSettings.galaxySaturation = parseFloat(colorSaturation.value);
    viewingSettings.starBrightness = parseFloat(starBrightness.value);
    viewingSettings.cosmicWebVisibility = document.getElementById('cosmic-web-visibility').checked;
    viewingSettings.autoHideDistantObjects = document.getElementById('auto-hide-distant').checked;
    
         viewingSettings.showStars = document.getElementById('show-stars').checked;
    viewingSettings.showGalaxies = document.getElementById('show-galaxies').checked;
    viewingSettings.showSuperClusters = document.getElementById('show-superclusters').checked;
    viewingSettings.onlyHomeGalaxy = document.getElementById('only-home-galaxy').checked;
    
         const newMaxDistance = viewingSettings.maxZoomDistance * 2000000;      camera.far = newMaxDistance;
    camera.updateProjectionMatrix();
    
         controls.maxDistance = newMaxDistance;
    
         updateGalaxyVisibility();
    updateStarBrightness();
}

function updateGalaxyVisibility() {
        updateVisibilitySettings();
    
    console.log("Galaxy visibility updated:", viewingSettings.galaxyVisibilityDistance, "M");
    console.log("Galaxy saturation updated:", viewingSettings.galaxySaturation * 100, "%");
}

function updateStarBrightness() {
    console.log("Star brightness updated:", viewingSettings.starBrightness * 100, "%");
}

 function updateVisibilitySettings() {
    const showStars = viewingSettings.showStars;
    const showGalaxies = viewingSettings.showGalaxies;
    const showSuperClusters = viewingSettings.showSuperClusters;
    const onlyHomeGalaxy = viewingSettings.onlyHomeGalaxy;
    
    if (homeGalaxy) {
        homeGalaxy.visible = showGalaxies || onlyHomeGalaxy;
        homeGalaxy.children.forEach(child => {
            if (child.userData && child.userData.isHomeGalaxyComponent) {
                child.visible = showStars;
            }
        });
    }
    
    galaxies.forEach(galaxy => {
        if (galaxy.userData && galaxy.userData.isHomeGalaxy) {
            galaxy.visible = showGalaxies || onlyHomeGalaxy;
            return;
        }
        
        if (onlyHomeGalaxy) {
            galaxy.visible = false;
        } else {
            galaxy.visible = showGalaxies;
        }
        
                if (galaxy.children && galaxy.children.length > 0) {
            galaxy.children.forEach(component => {
                component.visible = galaxy.visible;
            });
        }
    });
    
        galaxyClusters.forEach(cluster => {
                cluster.visible = showGalaxies && showSuperClusters && !onlyHomeGalaxy;
        
                if (cluster.children && cluster.children.length > 0) {
            cluster.children.forEach(component => {
                component.visible = cluster.visible;
            });
        }
    });
    
    superClusters.forEach(cluster => {
        cluster.visible = showSuperClusters && !onlyHomeGalaxy;
    });
    
    console.log("Visibility settings updated:", {
        showStars,
        showGalaxies,
        showSuperClusters,
        onlyHomeGalaxy
    });
}

 function updateQuality() {
    const quality = document.getElementById('quality-select').value;
    
    switch (quality) {
        case 'low':
            renderer.setPixelRatio(window.devicePixelRatio * 0.5);
            settings.graphicsQuality = 1;
            break;
        case 'medium':
            renderer.setPixelRatio(window.devicePixelRatio);
            settings.graphicsQuality = 2;
            break;
        case 'high':
            renderer.setPixelRatio(window.devicePixelRatio * 1.5);
            settings.graphicsQuality = 3;
            break;
    }
}

 function updateStarsDensity() {
              const density = document.getElementById('stars-density').value;
    console.log(`Stars density set to: ${density}`);
     }

 function updateRotationSpeed() {
    const speed = parseFloat(document.getElementById('rotation-speed').value);
    controls.rotateSpeed = speed;
}

 function updateZoomSpeed() {
    const speed = parseFloat(document.getElementById('zoom-speed').value);
    controls.zoomSpeed = speed;
}

 function updateOrbitLines() {
    const showOrbitLines = document.getElementById('orbit-lines').checked;
    orbitLines.forEach(line => {
        line.visible = showOrbitLines && !realScale;
    });
}

 function updatePlanetLabels() {
    const showLabels = document.getElementById('planet-labels').checked;
         console.log(`Planet labels: ${showLabels ? 'shown' : 'hidden'}`);
     }

 function updateGalaxyRotations(deltaTime) {
        if (homeGalaxy) {
        homeGalaxy.rotation.y += homeGalaxy.userData.rotationSpeed * smoothTimeSpeed * deltaTime * 2;     }
    
        galaxies.forEach(galaxy => {
        if (galaxy && galaxy.userData && galaxy.userData.rotationSpeed) {
            galaxy.rotation.y += galaxy.userData.rotationSpeed * smoothTimeSpeed * deltaTime * 4;         }
    });
    
        galaxyClusters.forEach(cluster => {
        if (cluster && cluster.userData) {
                        if (!cluster.userData.rotationSpeed) {
                cluster.userData.rotationSpeed = galaxyRotationSpeed * 0.5 * Math.random();
            }
            cluster.rotation.y += cluster.userData.rotationSpeed * smoothTimeSpeed * deltaTime * 2.8;         }
    });
}

function createMoon(moonId) {
    const data = orbitalData[moonId];
    
    const texture = new THREE.TextureLoader().load(planetData[moonId].texturePath);
    
        let moonSize;
    if (realScale) {
                const sizeRatio = data.realSize / orbitalData.sun.realSize;
        moonSize = orbitalData.sun.size * sizeRatio;
        
                        if (moonId === 'moon') {
                        const earthSizeRatio = orbitalData.earth.realSize / orbitalData.sun.realSize;
            const earthSize = orbitalData.sun.size * earthSizeRatio;
            moonSize = earthSize * 0.27;
        }
        
                moonSize = Math.max(moonSize, 0.15);
    } else {
                moonSize = data.size;
    }
    
    const geometry = new THREE.SphereGeometry(moonSize, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.1,
        roughness: 0.8
    });
    
    const moon = new THREE.Mesh(geometry, material);
    moon.castShadow = true;
    moon.receiveShadow = true;
    
    moon.userData = { 
        moonId: moonId,
        parentPlanet: data.parentPlanet
    };
    
    return moon;
}

function createMoonOrbitLine(moonId) {
    const data = orbitalData[moonId];
    const parentPlanetId = data.parentPlanet;
    
    let orbitMultiplier;
        orbitMultiplier = 300;
    
        const orbitRadius = realScale ? 
        data.realEarthOrbitRadius * orbitMultiplier : 
        data.earthOrbitRadius * orbitMultiplier;
    
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
        color: 0x777788,         transparent: true,
        opacity: 0.4,
        linewidth: 1
    });
    
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = orbitRadius * Math.cos(theta);
        const z = orbitRadius * Math.sin(theta);
        points.push(new THREE.Vector3(x, 0, z));
    }
    
    geometry.setFromPoints(points);
    
    const orbitLine = new THREE.Line(geometry, material);
    orbitLine.userData = {
        isMoonOrbit: true,
        parentPlanet: parentPlanetId,
        moonId: moonId
    };
    
    return orbitLine;
}

 window.addEventListener('load', init); 
