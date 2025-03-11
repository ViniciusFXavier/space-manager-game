import { CONFIG } from './config.js';

// Grid creation and management
export const GridManager = {
    // Create and return the grid mesh
    createGrid: function() {
        // Create the main grid helper
        const gridHelper = new THREE.GridHelper(
            CONFIG.grid.size,
            CONFIG.grid.divisions,
            CONFIG.grid.centerColor,
            CONFIG.grid.color
        );
        
        // Make the grid semi-transparent
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.5;
        
        // Create a plane for detecting clicks on the grid
        const gridGeometry = new THREE.PlaneGeometry(CONFIG.grid.size, CONFIG.grid.size);
        const gridMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide,
            visible: true
        });
        
        const gridPlane = new THREE.Mesh(gridGeometry, gridMaterial);
        gridPlane.rotation.x = Math.PI / 2;
        gridPlane.position.y = -0.01; // Slightly below the grid helper
        gridPlane.name = 'gridPlane';
        
        // Create a group to hold both the visual grid and the invisible plane
        const gridGroup = new THREE.Group();
        gridGroup.add(gridHelper);
        gridGroup.add(gridPlane);
        
        return gridGroup;
    },
    
    // Get the coordinates of a grid point from a 3D intersection
    getGridCoords: function(intersection) {
        if (!intersection) return null;
        
        const point = intersection.point;
        
        // Round to nearest grid cell
        const gridX = Math.round(point.x);
        const gridZ = Math.round(point.z);
        
        return { x: gridX, y: gridZ };
    }
};
