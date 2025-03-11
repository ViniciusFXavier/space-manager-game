import { FactionManager } from './factions.js';
import { EntityManager } from './entities.js';
import { Utils } from './utils.js';

// AI management for non-player factions
export const FactionAI = {
  // Store last ship creation time for each station
  stationCooldowns: {}, // { stationId: lastCreationTime }

  // Time between ship creations per station (in milliseconds)
  shipCreationCooldown: 2 * 60 * 1000, // 2 minutes

  // Initialize AI manager
  init: function () {
    // Set up periodic decision making for non-player factions
    this.makeDecisions()
    setInterval(() => this.makeDecisions(), 2000); // Make decisions every 5 seconds
  },

  // Make decisions for all non-player factions
  makeDecisions: function () {
    // Get all non-player factions
    const factionsWithManager = FactionManager.factions.filter(
      faction => faction.factionAi
    );

    // For each non-player faction
    factionsWithManager.forEach(faction => {
      // Get all entities belonging to this faction
      const factionEntities = EntityManager.entities.filter(
        entity => entity.faction.id === faction.id
      );

      // Process ships
      const ships = factionEntities.filter(entity => entity.type === 'ship' && entity.isMoving === false);
      ships.forEach(ship => {
        // Each ship has a 50% chance to receive a movement order
        if (Math.random() < 0.5) {
          this.moveShipRandomly(ship);
        }
      });

      // Process stations
      const stations = factionEntities.filter(entity => entity.type === 'station');
      stations.forEach(station => {
        // Try to create a ship from each station
        this.tryCreateShipFromStation(station);
      });
    });
  },

  // Move a ship to a random location or a station
  moveShipRandomly: function (ship) {
    // 70% chance to move to a random location, 30% chance to move to a station
    if (Math.random() < 0.7) {
      // Move to random location within range
      const range = 50; // Maximum movement range
      const currentX = ship.gridPosition.x;
      const currentY = ship.gridPosition.y;

      // Generate random target within range
      const targetX = currentX + Utils.randomInt(-range, range);
      const targetY = currentY + Utils.randomInt(-range, range);

      // Move the ship
      EntityManager.moveShipTo(ship, targetX, targetY);
    } else {
      // Try to move to a friendly station if one exists
      const stations = EntityManager.entities.filter(
        entity => entity.type === 'station'
      );

      if (stations.length > 0) {
        // Pick a random friendly station
        const targetStation = stations[Math.floor(Math.random() * stations.length)];

        // Get position near the station (not directly on it)
        const offsetX = Utils.randomInt(-3, 3);
        const offsetY = Utils.randomInt(-3, 3);

        // Ensure we're not at exactly 0,0 offset
        const finalOffsetX = offsetX === 0 && offsetY === 0 ? 1 : offsetX;

        // Move to the station (with offset)
        EntityManager.moveShipTo(
          ship,
          targetStation.gridPosition.x + finalOffsetX,
          targetStation.gridPosition.y + offsetY
        );
      } else {
        // No stations, just move randomly
        const range = 50; // Maximum movement range
        const targetX = ship.gridPosition.x + Utils.randomInt(-range, range);
        const targetY = ship.gridPosition.y + Utils.randomInt(-range, range);
        EntityManager.moveShipTo(ship, targetX, targetY);
      }
    }
  },

  // Try to create a new ship from a station if cooldown allows
  tryCreateShipFromStation: function (station) {
    const now = Date.now();
    const lastCreation = this.stationCooldowns[station.id] || 0;

    // Check if cooldown has passed
    if (now - lastCreation >= this.shipCreationCooldown) {
      // Create new ship at a position slightly offset from the station
      const offsetX = Utils.randomInt(-3, 3);
      const offsetY = Utils.randomInt(-3, 3);

      // Ensure we're not at exactly 0,0 offset
      const finalOffsetX = offsetX === 0 && offsetY === 0 ? 1 : offsetX;

      // Create the ship
      EntityManager.createShip(
        station.gridPosition.x + finalOffsetX,
        station.gridPosition.y + offsetY,
        station.faction
      );

      // Update cooldown
      this.stationCooldowns[station.id] = now;
    }
  }
};
