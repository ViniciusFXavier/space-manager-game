// Utility functions for the game

export const Utils = {
    // Convert 3D world position to 2D grid coordinates
    worldToGrid: function (position) {
        return {
            x: Math.round(position.x),
            y: Math.round(position.z)
        };
    },

    // Convert 2D grid coordinates to 3D world position
    gridToWorld: function (gridX, gridY, elevation = 0) {
        return {
            x: gridX,
            y: elevation,
            z: gridY
        };
    },

    // Raycast from mouse position to get intersections with objects
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),

    getIntersects: function (event, camera, objects) {
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, camera);

        // Calculate objects intersecting the picking ray
        return this.raycaster.intersectObjects(objects, true);
    },

    // Generate a random integer between min and max (inclusive)
    randomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};
