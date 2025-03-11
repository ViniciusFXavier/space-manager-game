// Faction management

export const FactionManager = {
    factions: [
        { id: 'player', name: 'Player Faction', color: 0x3498db },
        { id: 'alpha', name: 'Alpha Federation', color: 0xe74c3c },
        { id: 'beta', name: 'Beta Coalition', color: 0x2ecc71 },
        { id: 'gamma', name: 'Gamma Empire', color: 0xf39c12 }
    ],

    playerFaction: null,

    // Initialize factions and set player faction
    init: function () {
        // Set player faction to the first faction by default
        this.playerFaction = this.factions[0];

        // Update UI
        const playerFactionElement = document.getElementById('playerFaction');
        if (playerFactionElement) {
            playerFactionElement.textContent = this.playerFaction.name;
            playerFactionElement.style.color = '#' + this.playerFaction.color.toString(16).padStart(6, '0');
        }
    },

    // Get faction by ID
    getFaction: function (id) {
        return this.factions.find(faction => faction.id === id);
    },

    // Get a random faction (excluding player faction)
    getRandomFaction: function () {
        const nonPlayerFactions = this.factions.filter(faction => faction.id !== this.playerFaction.id);
        const randomIndex = Math.floor(Math.random() * nonPlayerFactions.length);
        return nonPlayerFactions[randomIndex];
    },

    // Check if faction is the player's faction
    isPlayerFaction: function (faction) {
        return faction.id === this.playerFaction.id;
    }
};
