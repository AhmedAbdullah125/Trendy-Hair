# Trandy Hair - Premium Beauty & Store App

Trandy Hair is a high-end mobile-first web application for a beauty store. It combines an e-commerce platform with a service booking system and an interactive reward-based quiz game.

## 🚀 Tech Stack

- **Framework**: React 19.2.1
- **Routing**: React Router 6.22.3 (using `HashRouter` for SPA navigation)
- **Styling**: Tailwind CSS with custom theme configuration
- **Icons**: Lucide React
- **Animations**: CSS Keyframes + Canvas Confetti
- **Typography**: Alexandria (Google Fonts) - Full RTL support
- **State Management**: React Hooks (useState, useMemo, useEffect, useRef)
- **Persistence**: LocalStorage for orders, favorites, and game state

## 📂 Project Structure

- `App.tsx` – The root application component. Handles top-level routing, global cart state, and toast notifications.
- `index.tsx` – Entry point for the React application.
- `index.html` – Main HTML template with global styles for scrollbar hiding and RTL setup.
- `types.ts` – Centralized TypeScript interfaces for Products, Orders, Game Stages, and State enums.
- `constants.ts` – App constants including colors, lock durations, and the `DEMO_PRODUCTS` and `GAME_STAGES` data.
- `metadata.json` – Project metadata.
- `services/audioService.ts` – Procedural audio generation using the Web Audio API for game sound effects.
- `components/`
  - `HomeTab.tsx` – The landing page featuring a fixed top header (Cart, Title, Menu) and a scrollable content area for banners and products.
  - `PlayTab.tsx` – The interactive quiz game. Includes the cooldown logic, live HH:MM:SS countdown timers, and reward management.
  - `AppointmentsTab.tsx` – A booking system with a custom iOS-style wheel time selector and calendar.
  - `ReviewsTab.tsx` – A grid of client video reviews using image thumbnails.
  - `AccountTab.tsx` – User profile management, order history, and favorites list with sub-routing.
  - `CartFlow.tsx` – A multi-step checkout experience: Cart View → Shipping Details (with Kuwait-specific regions) → Success/Order Confirmation.
  - `TabBar.tsx` – The persistent bottom navigation bar.
  - `Timeline.tsx` – A visual progress tracker used within the game to show current question progress.
  - `GameScreen.tsx` – The UI for individual quiz questions, handling animations and confetti feedback.

## 🎮 Game & Cooldown Logic

The app features a "Play" tab where users can win prizes.
- **Rules**: 3 stages, 5 questions each. Users can withdraw at milestones or risk it all for the grand prize.
- **Cooldowns**:
  - **Loss Cooldown**: If a user answers incorrectly or time expires, they are locked out for 1 hour (`LOCK_DURATION_MS`).
  - **Daily Win**: Users can only win the grand prize once per day.
- **Countdown**: A live HH:MM:SS timer is rendered in the `PlayTab` using `setInterval` to calculate the difference between `Date.now()` and the target unlock timestamp stored in LocalStorage.
- **Prize Persistence**: The `lastWonStageIndex` is saved to differentiate between small, medium, and grand prize wins on the cooldown screen.

## 🛒 Cart & Checkout Flow

Managed via `CartFlow.tsx`, the flow is state-driven:
1. **Cart**: List items, update quantities, or remove products.
2. **Details**: Collect shipping info (Name, Governorate, Area, Details) and select payment method (Online or COD).
3. **Success**: Generates a mock order ID and moves the items to the "Orders" history in the Account tab.

## 🛠 Maintenance Notes for AI Assistants

- **Source of Truth**: This README is the primary documentation for the current architecture.
- **Routing**: Always use React Router hooks (`useNavigate`, `useParams`) for navigation to maintain history state. This prevents the "Back" button from closing the Webview.
- **Scrollbars**: Global CSS in `index.html` hides scrollbars across all browsers while maintaining functionality. Do not re-enable them without a specific request.
- **RTL**: The app is strictly Right-to-Left (RTL). Ensure UI layouts and padding/margins respect this (e.g., `pr-` for right padding on search inputs).
- **Updates**: Whenever changing core logic or adding/removing files, update this README's structure and changelog sections.

---

## 📝 Changelog

### 2025-05-22
- Added `README.md` with full project documentation.
- Integrated `HashRouter` for robust back-button handling in Webviews.
- Implemented live HH:MM:SS countdown for game cooldowns.
- Cleaned up `PlayTab` cooldown UI to focus on the timer during lock periods.
- Hidden vertical scrollbars globally across the app.
- Fixed the winning screen to display the actual prize tier won (Small/Medium/Grand).
- Added a visual green checkmark badge on the specific prize card earned on the cooldown screen.
- Updated `HomeTab` layout to use a fixed header and independent scroll area for improved mobile UX.