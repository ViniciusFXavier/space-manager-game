import './style.css'
// Main game initialization and loop

// Import dependencies
import { CONFIG } from './config.js';
import { GridManager } from './grid.js';
import { FactionManager } from './factions.js';
import { EntityManager } from './entities.js';
import { CameraControls } from './camera-controls.js';
import { ContextMenu } from './context-menu.js';

// Global variables
let scene, camera, renderer;
let grid;

// Initialize the game
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111122);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        CONFIG.camera.fov,
        window.innerWidth / window.innerHeight,
        CONFIG.camera.near,
        CONFIG.camera.far
    );

    // Set initial camera position
    camera.position.set(
        CONFIG.camera.initialPosition.x,
        CONFIG.camera.initialPosition.y,
        CONFIG.camera.initialPosition.z
    );

    camera.lookAt(new THREE.Vector3(camera.position.x, 0, camera.position.z));

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    // Create grid
    grid = GridManager.createGrid();
    scene.add(grid);

    // Initialize subsystems
    FactionManager.init();
    EntityManager.init(scene);
    CameraControls.init(camera);
    ContextMenu.init();

    // Create initial entities for demonstration
    EntityManager.createInitialEntities();

    // Set up event handlers
    setupEventHandlers();

    // Start animation loop
    animate();
}

// Set up event handlers
function setupEventHandlers() {
    // Right-click context menu
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault();

        // Get mouse position and raycaster
        const mouse = {
            x: (event.clientX / window.innerWidth) * 2 - 1,
            y: -(event.clientY / window.innerHeight) * 2 + 1
        };

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        // If waiting for move target, show the move target context menu
        if (EntityManager.waitingForMoveTarget) {
            const gridIntersects = raycaster.intersectObjects([grid.children[1]], true);

            if (gridIntersects.length > 0) {
                const gridCoords = GridManager.getGridCoords(gridIntersects[0]);
                if (gridCoords) {
                    ContextMenu.showMoveTargetMenu(event.clientX, event.clientY, gridCoords.x, gridCoords.y);
                }
            }
            return;
        }

        // First check for intersections with entities
        const entityMeshes = EntityManager.getAllMeshes();
        const entityIntersects = raycaster.intersectObjects(entityMeshes, true);

        if (entityIntersects.length > 0) {
            // Find the entity that was clicked
            const mesh = entityIntersects[0].object;
            const entity = EntityManager.findEntityByMesh(mesh);

            if (entity) {
                if (entity.type === 'ship') {
                    ContextMenu.showShipMenu(event.clientX, event.clientY, entity);
                } else if (entity.type === 'station') {
                    ContextMenu.showStationMenu(event.clientX, event.clientY, entity);
                }
                return;
            }
        }

        // If no entity was clicked, check for grid plane intersection
        const gridIntersects = raycaster.intersectObjects([grid.children[1]], true);

        if (gridIntersects.length > 0) {
            const gridCoords = GridManager.getGridCoords(gridIntersects[0]);
            if (gridCoords) {
                ContextMenu.showEmptyGridMenu(event.clientX, event.clientY, gridCoords.x, gridCoords.y);
            }
        }
    });

    // Left-click for selecting destination when moving ships
    document.addEventListener('click', (event) => {
        // Only process if waiting for move target
        // if (!EntityManager.waitingForMoveTarget) return;

        // // Get mouse position and raycaster
        // const mouse = {
        //     x: (event.clientX / window.innerWidth) * 2 - 1,
        //     y: -(event.clientY / window.innerHeight) * 2 + 1
        // };

        // const raycaster = new THREE.Raycaster();
        // raycaster.setFromCamera(mouse, camera);

        // Check for grid plane intersection
        // const gridIntersects = raycaster.intersectObjects([grid.children[1]], true);

        // if (gridIntersects.length > 0) {
        //     const gridCoords = GridManager.getGridCoords(gridIntersects[0]);
        //     console.log('gridCoords: ', gridCoords);
        //     if (gridCoords) {
        //         EntityManager.handleMoveTargetSelection(gridCoords.x, gridCoords.y);
        //     }
        // }
    });

    // Add ESC key handler for canceling move target selection
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && EntityManager.waitingForMoveTarget) {
            EntityManager.targetShip = null;
            EntityManager.waitingForMoveTarget = false;
        }
    });

    // Window resize event
    window.addEventListener('resize', onWindowResize);
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update TWEEN animations
    TWEEN.update();

    // Render scene
    renderer.render(scene, camera);
}

// Start the game
window.onload = init;
