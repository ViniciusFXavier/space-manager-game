# Space Manager Game

A Space Manager strategy game with faction management, inspired by X4 Foundations, built with Three.js.

![Space Manager Game Screenshot](https://github.com/user-attachments/assets/3e26503b-0b36-45d3-b3f4-3f54b1ea9dc1)

## Overview

This project is a prototype of a space management game where players control ships and stations in a 2D grid-based universe. Players can move ships, manage resources, and interact with AI-controlled factions.

## Features

- **Interactive 3D Grid System**: Navigate through space with full camera panning and zooming capabilities.
- **Faction Management**: Play as one faction and interact with AI-controlled rival factions.
- **Ship and Station Control**: Create and move ships, establish stations, and build your empire.
- **Context Menu System**: Right-click interactions for game objects and empty grid spaces.
- **AI Management**: Optional AI manager that can control your faction operations.
- **Enemy AI**: Computer-controlled factions that create ships and expand autonomously.

## Controls

- **Mouse Drag**: Pan the camera across the grid
- **Mouse Wheel**: Zoom in and out
- **Right-Click**: Open context menu for grid spaces and game entities
- **ESC Key**: Cancel current move operation

## Game Entities

### Ships
- Movable units that belong to specific factions
- Can be created at stations or for testing purposes
- Each ship has a defined velocity for movement calculations

### Stations
- Stationary bases that can produce ships
- Have a cooldown period between ship creation (2 minutes)
- Serve as strategic points for faction expansion

## Factions

The game features multiple factions, each with distinct colors and behaviors:
- **Player Faction** (Blue): Controlled by the player
- **Alpha Federation** (Red): AI-controlled faction
- **Beta Coalition** (Green): AI-controlled faction
- **Gamma Empire** (Orange): AI-controlled faction

Each faction can be managed by the AI if the player enables the faction AI manager.

## Technical Structure

The game is built with a modular architecture with the following components:

- `main.js`: Core game initialization and main loop
- `config.js`: Configuration settings for grid, camera, and game objects
- `grid.js`: Grid creation and management
- `camera-controls.js`: Camera panning and zooming functionality
- `entities.js`: Management of game entities (ships and stations)
- `factions.js`: Faction definition and management
- `faction-ai.js`: AI behavior for computer-controlled factions
- `context-menu.js`: Right-click menu system

## Development Roadmap

### Current Functionality
- Interactive grid with camera controls
- Entity creation and movement
- Faction system with AI behavior
- Context menu interactions

### Planned Features
- Resource gathering and management
- Combat system between rival factions
- Tech tree and ship upgrades
- Enhanced AI behaviors
- Mission system
- Trading and economy

## Dependencies
- Three.js: 3D graphics library
- Tween.js: Animation library for smooth transitions

## Credits
This project was created as a personal challenge, inspired by the space management aspects of X4 Foundations.