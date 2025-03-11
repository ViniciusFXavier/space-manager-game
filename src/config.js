// Configuration settings for the game

export const CONFIG = {
    // Grid configuration
    grid: {
        size: 1000,
        divisions: 200,
        color: 0x444444,
        centerColor: 0x888888
    },
    
    // Camera configuration
    camera: {
        fov: 60,
        near: 0.1,
        far: 1000,
        initialPosition: { x: 0, y: 30, z: 0 },
        minZoom: 5,
        maxZoom: 100,
        zoomSpeed: 0.1
    },
    
    // Game objects configuration
    objects: {
        ship: {
            width: 2,
            height: 4,
            defaultElevation: 1
        },
        station: {
            radius: 3,
            segments: 32,
            defaultElevation: 0.5
        }
    },
    
    // Movement configuration
    movement: {
        duration: 2000, // milliseconds
        maxElevation: 3  // Maximum Z elevation during movement
    }
};
