import { FactionManager } from './factions.js';
import { EntityManager } from './entities.js';

// Context menu management
export const ContextMenu = {
    menu: null,
    menuOptions: null,
    targetEntity: null,
    stationCooldowns: {}, // Track cooldowns for player station ship creation
    shipCreationCooldown: 2 * 60 * 1000, // 2 minutes

    // Initialize context menu
    init: function () {
        this.menu = document.getElementById('contextMenu');
        this.menuOptions = document.getElementById('menuOptions');

        // Add event listener to hide menu on outside click
        document.addEventListener('click', (event) => {
            if (!this.menu.contains(event.target)) {
                this.hideMenu();
            }
        });

        // Prevent default right-click behavior
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
    },

    // Show context menu at cursor position
    showMenu: function (x, y) {
        this.menu.style.left = x + 'px';
        this.menu.style.top = y + 'px';
        this.menu.style.display = 'block';
    },

    // Hide context menu
    hideMenu: function () {
        this.menu.style.display = 'none';
        this.targetEntity = null;
    },

    // Create and display menu for an empty grid position
    showEmptyGridMenu: function (x, y, gridX, gridY) {
        this.clearMenuOptions();

        // Add option to create a new ship
        const createShipOption = document.createElement('li');
        createShipOption.textContent = 'Test Create Ship';
        createShipOption.addEventListener('click', () => {
            EntityManager.createShip(gridX, gridY, FactionManager.playerFaction);
            this.hideMenu();
        });
        this.menuOptions.appendChild(createShipOption);

        this.showMenu(x, y);
    },

    // Create and display menu for a ship
    showShipMenu: function (x, y, ship) {
        this.clearMenuOptions();
        this.targetEntity = ship;

        // Add information about the ship
        const infoOption = document.createElement('li');
        infoOption.textContent = `${ship.faction.name} Ship`;
        infoOption.style.fontWeight = 'bold';
        infoOption.style.color = '#' + ship.faction.color.toString(16).padStart(6, '0');
        this.menuOptions.appendChild(infoOption);

        // If ship belongs to player faction, add "Move to" option
        if (FactionManager.isPlayerFaction(ship.faction)) {
            const moveToOption = document.createElement('li');
            moveToOption.textContent = 'Move to...';
            moveToOption.addEventListener('click', () => {
                EntityManager.setTargetShipForMove(ship);
                this.hideMenu();
            });
            this.menuOptions.appendChild(moveToOption);
        }

        this.showMenu(x, y);
    },

    // Create and display menu for a station
    showStationMenu: function (x, y, station) {
        this.clearMenuOptions();
        this.targetEntity = station;

        // Add information about the station
        const infoOption = document.createElement('li');
        infoOption.textContent = `${station.faction.name} Station`;
        infoOption.style.fontWeight = 'bold';
        infoOption.style.color = '#' + station.faction.color.toString(16).padStart(6, '0');
        this.menuOptions.appendChild(infoOption);

        // If station belongs to player faction, add "Create Ship" option
        if (FactionManager.isPlayerFaction(station.faction)) {
            const now = Date.now();
            const lastCreation = this.stationCooldowns[station.id] || 0;
            const cooldownRemaining = this.shipCreationCooldown - (now - lastCreation);

            const createShipOption = document.createElement('li');

            if (cooldownRemaining <= 0) {
                createShipOption.textContent = 'Create Ship';
                createShipOption.addEventListener('click', () => {
                    // Find a free position near the station
                    const freePos = EntityManager.findFreePositionNear(
                        station.gridPosition.x,
                        station.gridPosition.y
                    );

                    // Create a new ship at that position
                    EntityManager.createShip(freePos.x, freePos.y, station.faction);

                    // Update cooldown
                    this.stationCooldowns[station.id] = now;

                    this.hideMenu();
                });
            } else {
                // Display cooldown remaining
                const secondsRemaining = Math.ceil(cooldownRemaining / 1000);
                const minutesRemaining = Math.floor(secondsRemaining / 60);
                const remainingSeconds = secondsRemaining % 60;

                createShipOption.textContent = `Create Ship (Cooldown: ${minutesRemaining}m ${remainingSeconds}s)`;
                createShipOption.style.opacity = '0.5';
                createShipOption.style.cursor = 'default';
            }

            this.menuOptions.appendChild(createShipOption);
        }

        // If station belongs to player faction, add "Ai Manager" option
        if (FactionManager.isPlayerFaction(station.faction)) {
            const aiManagerOption = document.createElement('li');
            const managerAiEnabled = FactionManager.playerFaction.factionAi
            aiManagerOption.textContent = (managerAiEnabled ? 'Disable' : 'Enable') + ' Ai Manager';
            aiManagerOption.addEventListener('click', () => {
                FactionManager.playerFaction.factionAi = !managerAiEnabled;
                this.hideMenu();
            })
            this.menuOptions.appendChild(aiManagerOption);
        }

        this.showMenu(x, y);
    },

    // Create and display menu for move target selection
    showMoveTargetMenu: function (x, y, gridX, gridY) {
        this.clearMenuOptions();

        // Add "Move here" option
        const moveHereOption = document.createElement('li');
        moveHereOption.textContent = 'Move here';
        moveHereOption.addEventListener('click', () => {
            EntityManager.handleMoveTargetSelection(gridX, gridY);
            this.hideMenu();
        });
        this.menuOptions.appendChild(moveHereOption);

        // Add "Cancel" option
        const cancelOption = document.createElement('li');
        cancelOption.textContent = 'Cancel';
        cancelOption.addEventListener('click', () => {
            EntityManager.targetShip = null;
            EntityManager.waitingForMoveTarget = false;
            this.hideMenu();
        });
        this.menuOptions.appendChild(cancelOption);

        this.showMenu(x, y);
    },

    // Clear menu options
    clearMenuOptions: function () {
        while (this.menuOptions.firstChild) {
            this.menuOptions.removeChild(this.menuOptions.firstChild);
        }
    }
};