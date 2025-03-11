import { CONFIG } from './config.js';

// Camera controls for panning and zooming
export const CameraControls = {
    camera: null,
    isDragging: false,
    previousMousePosition: { x: 0, y: 0 },

    // Initialize camera controls
    init: function (camera) {
        this.camera = camera;
        this.setupEventListeners();
    },

    // Set up event listeners for mouse controls
    setupEventListeners: function () {
        const container = document.getElementById('container');

        // Mouse down event for starting camera drag
        container.addEventListener('mousedown', (event) => {
            // Only initiate drag on left mouse button
            if (event.button === 0) {
                this.isDragging = true;
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        });

        window.addEventListener('mousemove', (event) => {
            if (this.isDragging) {
                const deltaX = event.clientX - this.previousMousePosition.x;
                const deltaY = event.clientY - this.previousMousePosition.y;
                
                // Move the camera based on mouse movement
                this.panCamera(deltaX, deltaY);
                
                this.previousMousePosition = {
                    x: event.clientX,
                    y: event.clientY
                };
            }
        });

        // Mouse up event for stopping camera drag
        window.addEventListener('mouseup', (event) => {
            if (event.button === 0) {
                this.isDragging = false;
            }
        });

        // Mouse wheel event for zooming
        container.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.zoomCamera(event);
        });

        // Window resize event
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    },

    // Pan the camera based on mouse movement
    panCamera: function (deltaX, deltaY) {
        // Get the world position under the previous mouse position
        const previousMouseWorld = this.getWorldPositionFromMouse(
            this.previousMousePosition.x,
            this.previousMousePosition.y
        );

        // Get the world position under the current mouse position
        const currentMouseWorld = this.getWorldPositionFromMouse(
            this.previousMousePosition.x + deltaX,
            this.previousMousePosition.y + deltaY
        );

        if (previousMouseWorld && currentMouseWorld) {
            // Move the camera by the difference in world positions
            this.camera.position.x -= (currentMouseWorld.x - previousMouseWorld.x);
            this.camera.position.z -= (currentMouseWorld.z - previousMouseWorld.z);

            // Keep looking at the point below the camera
            this.camera.lookAt(new THREE.Vector3(
                this.camera.position.x,
                0,
                this.camera.position.z
            ));
        }
    },

    // Helper method to get world position from mouse coordinates
    getWorldPositionFromMouse: function (mouseX, mouseY) {
        // Convert mouse coordinates to normalized device coordinates
        const normalizedX = (mouseX / window.innerWidth) * 2 - 1;
        const normalizedY = -(mouseY / window.innerHeight) * 2 + 1;

        // Create a ray from the camera through the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(normalizedX, normalizedY), this.camera);

        // Find the point on the grid plane
        const planeNormal = new THREE.Vector3(0, 1, 0);
        const planeConstant = 0; // Grid is at y=0
        const plane = new THREE.Plane(planeNormal, planeConstant);
        const worldPosition = new THREE.Vector3();

        if (raycaster.ray.intersectPlane(plane, worldPosition)) {
            return worldPosition;
        }

        return null;
    },

    // Zoom camera based on mouse wheel
    zoomCamera: function (event) {
        // Calculate zoom direction and factor
        const zoomDirection = event.deltaY > 0 ? -1 : 1; // Changed from 1 : -1 to -1 : 1
        const zoomFactor = CONFIG.camera.zoomSpeed * zoomDirection;

        // Get mouse position for zoom targeting
        const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

        // Create a ray from the camera through the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this.camera);

        // Find the point on the grid plane
        const planeNormal = new THREE.Vector3(0, 1, 0);
        const planeConstant = 0; // Grid is at y=0
        const plane = new THREE.Plane(planeNormal, planeConstant);
        const targetPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, targetPoint);

        // Calculate new camera position
        const direction = new THREE.Vector3().subVectors(targetPoint, this.camera.position).normalize();

        // Move camera towards or away from target point
        const distanceChange = this.camera.position.y * zoomFactor;

        this.camera.position.add(direction.multiplyScalar(distanceChange));

        // Adjust camera position to maintain looking at the same point
        this.camera.lookAt(new THREE.Vector3(
            this.camera.position.x,
            0,
            this.camera.position.z
        ));
    },

    // Handle window resize
    handleResize: function () {
        if (!this.camera) return;

        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }
};
