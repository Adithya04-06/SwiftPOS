# Figma Import Guide

## Overview
This directory contains a complete Figma-ready design package for the SwiftPOS application. It includes SVGs, HTML previews, and design documentation.

## Import Procedure
1. Create a new Figma Design file.
2. Create the following pages:
   - Prototype
   - Design System
   - Components
   - Presentation
3. Import SVG screens and assets by dragging and dropping them into Figma.
4. Organize each screen into a 1440×900 frame.
5. Create prototype connections based on `PROTOTYPE-FLOW.md`.
6. Convert imported SVG components into native Figma Components and add variants as documented in `COMPONENTS.md`.
7. Verify typography (Inter font) and spacing using the `DESIGN-SYSTEM.md`.
8. Present the final prototype using the assets in the `presentation/` folder.

## Note on SVGs
The provided SVGs are designed to be as clean and editable as possible. Text elements and shapes should import smoothly. You may need to adjust some layer groupings and convert certain groups to auto-layout frames for maximum flexibility.
