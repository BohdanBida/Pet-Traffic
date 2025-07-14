# 🛣️ Traffic Simulation System

There is a simulation engine running in the browser via HTML canvas. It models roads, intersections, cars, traffic lights, and user editor using a modular architecture without any front-end framework.

---

## 🚀 Features

- Real-time rendering on canvas
- Modular state management using RxJS
- Simulation & Edit modes
- Custom Dependency Injection system
- Undo/Redo state history manager
- Templates for examples
- Saving & Uploading of custom template
- Interactive UI via mouse and keyboard events
- Notification system for user actions and debug logs

---

## 🧠 Architecture

This project follows a layered structure:

- **Core**: Common app services, DI container
- **Components**: UI elements rendered in DOM (e.g. popups, controls, panels)
- **Features**: Mode-specific logic (Simulation, Edit)
- **State**: Central app state with reactive observables
- **Helpers**: DOM and utility helpers

---

## 📦 Setup & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## 🎯 Planned Improvements

- [ ] **Refactor `App` class** to follow Single Responsibility Principle
- [ ] **Add tests** using Jest
- [ ] Add **unit-tested utility functions** and mocks for simulations
- [ ] Abstract canvas drawing with a basic **virtual rendering system**
- [ ] Add **performance profiler panel** (FPS, frame time, object count)
- [ ] Improvements and new features for simulation mode (animations, single traffic lights, multilane movement, bigger map with zoom)
- [ ] Improvements for edit mode (road splitting, new objects)
- [ ] Realtime adjustment of traffic light switching time dependent on the load of roads

---
