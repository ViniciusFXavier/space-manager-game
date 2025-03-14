import { FactionManager } from './factions.js';
import { Utils } from './utils.js';
import { CONFIG } from './config.js';

// Game entities (ships and stations)
export const EntityManager = {
    entities: [],
    scene: null,
    targetShip: null,
    waitingForMoveTarget: false,

    // Initialize the entity manager
    init: function (scene) {
        this.scene = scene;
        this.entities = [];
    },

    // Create a ship at the specified grid position
    createShip: function (gridX, gridY, faction) {
        const worldPos = Utils.gridToWorld(gridX, gridY, CONFIG.objects.ship.defaultElevation);

        // Create ship geometry
        const geometry = new THREE.BoxGeometry(
            CONFIG.objects.ship.width,
            CONFIG.objects.ship.width / 2,
            CONFIG.objects.ship.height
        );

        // Create material with faction color
        const material = new THREE.MeshBasicMaterial({ color: faction.color });

        // Create mesh
        const shipMesh = new THREE.Mesh(geometry, material);

        // Position the ship
        shipMesh.position.set(worldPos.x, worldPos.y, worldPos.z);

        // Create entity object
        const ship = {
            id: 'ship_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            type: 'ship',
            velocity: 10,
            faction,
            mesh: shipMesh,
            gridPosition: { x: gridX, y: gridY },
            isMoving: false
        };

        // Add to scene and entity list
        this.scene.add(shipMesh);
        this.entities.push(ship);

        return ship;
    },

    // Create a station at the specified grid position
    createStation: function (gridX, gridY, faction) {
        const worldPos = Utils.gridToWorld(gridX, gridY, CONFIG.objects.station.defaultElevation);

        // Create station geometry
        const geometry = new THREE.CylinderGeometry(
            CONFIG.objects.station.radius,
            CONFIG.objects.station.radius,
            CONFIG.objects.station.radius / 2,
            CONFIG.objects.station.segments
        );

        // Create material with faction color
        const material = new THREE.MeshBasicMaterial({ color: faction.color });

        // Create mesh
        const stationMesh = new THREE.Mesh(geometry, material);

        // Position the station
        stationMesh.position.set(worldPos.x, worldPos.y, worldPos.z);

        // Create entity object
        const station = {
            id: 'station_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            type: 'station',
            faction: faction,
            mesh: stationMesh,
            gridPosition: { x: gridX, y: gridY }
        };

        // Add to scene and entity list
        this.scene.add(stationMesh);
        this.entities.push(station);

        return station;
    },

    // Check if a position is currently occupied
    isPositionOccupied: function(gridX, gridY) {
        return this.entities.some(entity => 
            entity.gridPosition.x === gridX && 
            entity.gridPosition.y === gridY
        );
    },

    // Find a free position near the given coordinates
    findFreePositionNear: function(gridX, gridY, maxRadius = 5) {
        // Check the original position first
        if (!this.isPositionOccupied(gridX, gridY)) {
            return { x: gridX, y: gridY };
        }
        
        // Spiral out to find a free position
        for (let r = 1; r <= maxRadius; r++) {
            for (let dx = -r; dx <= r; dx++) {
                for (let dy = -r; dy <= r; dy++) {
                    // Only check the perimeter of the current radius
                    if (Math.abs(dx) === r || Math.abs(dy) === r) {
                        const x = gridX + dx;
                        const y = gridY + dy;
                        
                        if (!this.isPositionOccupied(x, y)) {
                            return { x, y };
                        }
                    }
                }
            }
        }
        
        // If no free position found, return a position outside the search radius
        return { x: gridX + maxRadius + 1, y: gridY + maxRadius + 1 };
    },

    // Move a ship to a new grid position with animation
    moveShipTo: function (ship, targetGridX, targetGridY) {
        if (!ship || ship.type !== 'ship') return;
        
        // Check if target position is occupied, find free position if needed
        const freePos = this.findFreePositionNear(targetGridX, targetGridY);
        targetGridX = freePos.x;
        targetGridY = freePos.y;

        const startPos = {
            x: ship.mesh.position.x,
            y: ship.mesh.position.y,
            z: ship.mesh.position.z
        };

        const endPos = Utils.gridToWorld(targetGridX, targetGridY, CONFIG.objects.ship.defaultElevation);

        // Calculate distance
        const dx = endPos.x - startPos.x;
        const dz = endPos.z - startPos.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Use a fixed velocity instead of fixed duration
        const duration = (distance / ship.velocity) * 1000; // convert to milliseconds
        
        // Calculate rotation angle now for smooth rotation
        const angle = Math.atan2(endPos.z - startPos.z, endPos.x - startPos.x);
        
        // Mark ship as moving
        ship.isMoving = true;

        // Create a tween for the animation
        const tween = new TWEEN.Tween(startPos)
            .to(endPos, duration)
            .onUpdate(function () {
                // Update position
                ship.mesh.position.set(startPos.x, startPos.y, startPos.z);
                
                // Rotate ship to face direction of movement
                // Subtract PI/2 to make the ship face the direction it's moving
                ship.mesh.rotation.y = angle - Math.PI / 2;
            })
            .onComplete(function () {
                // Update the ship's grid position
                ship.gridPosition = { x: targetGridX, y: targetGridY };
                // Mark ship as no longer moving
                ship.isMoving = false;
            })
            .start();
    },

    // Find entity by mesh
    findEntityByMesh: function (mesh) {
        return this.entities.find(entity => entity.mesh === mesh || entity.mesh.children.includes(mesh));
    },

    // Set target ship for "move to" command
    setTargetShipForMove: function (ship) {
        this.targetShip = ship;
        this.waitingForMoveTarget = true;
    },

    // Handle grid click when waiting for move target
    handleMoveTargetSelection: function (gridX, gridY) {
        if (this.waitingForMoveTarget && this.targetShip) {
            this.moveShipTo(this.targetShip, gridX, gridY);
            this.targetShip = null;
            this.waitingForMoveTarget = false;
            return true;
        }
        return false;
    },

    // Get all meshes for intersection testing
    getAllMeshes: function () {
        return this.entities.map(entity => entity.mesh);
    },

    // Create some initial entities for testing
    createInitialEntities: function () {
        // Create player ships
        this.createShip(-10, -10, FactionManager.playerFaction);
        this.createShip(-8, -12, FactionManager.playerFaction);
        this.createShip(-12, -8, FactionManager.playerFaction);

        // Create player station
        this.createStation(-10, -14, FactionManager.playerFaction);

        // Create some enemy ships and stations
        const factions = FactionManager.factions.filter(f => f.id !== FactionManager.playerFaction.id);

        factions.forEach((faction, index) => {
            const baseX = 10 * (index + 1);
            const baseY = 10 * (index + 1);

            // Create enemy ships
            this.createShip(baseX, baseY, faction);
            this.createShip(baseX + 2, baseY + 2, faction);

            // Create enemy station
            this.createStation(baseX + 4, baseY + 4, faction);
        });
    }
};
