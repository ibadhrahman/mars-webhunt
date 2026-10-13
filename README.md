# Set 2: Signal From Mars · Game Master & Organizer Guide

## 🚀 Theme & Overview
- **Title:** Signal From Mars (Ares-4 Colony Subsurface Telemetry)
- **Genre:** Sci-Fi / Space Station Escape Room
- **Look & Feel:** Dark mode, glowing green phosphor CRT terminal (`#00ff66`), scanlines, CRT screen flicker, and retro Web Audio synthesizer beeps & chimes (no external assets required, 100% offline).
- **Target Completion Time:** ~7 to 10 minutes (strictly designed for a 12-minute time limit).
- **Structure:** 4 connected puzzle pages, moving from one to the next by entering the previous sector's password, plus an Emergency Relay Console that validates all 4 passwords and yields the passcode for **Set 3**.

---

## 🗺️ Page Flow & Walkthrough

| Step | Page File | Sector | Puzzle Type | Solution | Solved Unlocks |
|:---:|:---|:---|:---|:---:|:---|
| **1** | [`index.html`](file:///c:/Users/ibadh/Desktop/webhunt/mars/index.html) | Sector 1: Comms | Intercepted Morse Code distress beacon with audio player and built-in NATO signal reference | **`BEACON`** | Unlocks Gate to Sector 2 |
| **2** | [`oxygen.html`](file:///c:/Users/ibadh/Desktop/webhunt/mars/oxygen.html) | Sector 2: Life Support | Oscilloscope graph showing 4 fluctuating O₂ pressure cycles; the 4 peaks are read as numbers | **`7492`** | Unlocks Gate to Sector 3 |
| **3** | [`roster.html`](file:///c:/Users/ibadh/Desktop/webhunt/mars/roster.html) | Sector 3: Crew Roster | 4 crew members listed with ranks; initials arranged in rank order (Rank I to Rank IV) | **`MARS`** | Unlocks Gate to Sector 4 |
| **4** | [`starmap.html`](file:///c:/Users/ibadh/Desktop/webhunt/mars/starmap.html) | Sector 4: Star Map | Interactive astrometric dome; click stars in order `VEGA ➔ DENEB ➔ ALTAIR ➔ POLARIS` | **`PHOBOS`** | Displays Next Set Passcode & Victory Banner |
| **5** | [`transmission.html`](file:///c:/Users/ibadh/Desktop/webhunt/mars/transmission.html) | Final Relay | Multi-sector dials & reversed audio transmission `SOBOHP - SRAM - 2947 - NOCAEB` | **`BEACON-7492-MARS-PHOBOS`** | Full Story Clearance & Copy Button |

---

## 🔑 Official Passcode for Next Set (Set 3)
```
BEACON-7492-MARS-PHOBOS
```
*(Also accepted: `BEACON7492MARSPHOBOS` or `BEACON 7492 MARS PHOBOS`)*

---

## 🧩 Detailed Puzzle Solutions & Time Estimates

### 1. Sector 1: Mission Log (`index.html`) — ~2 minutes
- **Distress Log Clue:** `− · · · / · / · − / − · − · / − − − / − ·`
- **Audio:** Players can click `[ ▶ PLAY TRANSMISSION BEACON ]` to hear the synthesized 750Hz Morse beeps in real-time.
- **Reference Table:** A collapsible *"Standard Code Reference"* is included right on the page.
  - `− · · ·` = **B**
  - `·` = **E**
  - `· −` = **A**
  - `− · − ·` = **C**
  - `− − −` = **O**
  - `− ·` = **N**
- **Answer:** `BEACON`

### 2. Sector 2: Oxygen Dashboard (`oxygen.html`) — ~2 minutes
- **Gate:** Enter `BEACON` to disengage the bio-lock.
- **Multi-Channel Waveform Clue:** 
  - Dual channels: Green line (Oxygen) and Amber line (Nitrogen carrier).
  - Realistic fluctuating line with noise ripples and pressure crests across 4 cycles.
  - Players must distinguish the primary Oxygen wave and identify the highest peak in each of the 4 cycles by tracing it to the Y-axis scale (0–10 kPa).
  - Interactive scope reticle follows the mouse cursor to assist with precision measurement.
  - **Cycle I Peak:** **7** kPa
  - **Cycle II Peak:** **4** kPa
  - **Cycle III Peak:** **9** kPa
  - **Cycle IV Peak:** **2** kPa
- **Answer:** `7492`

### 3. Sector 3: Crew Roster (`roster.html`) — ~1.5 minutes
- **Gate:** Enter `7492` to access the personnel database.
- **Clue:** The terminal displays a short note: *"Respect the chain of command."*
- **Roster Table:** 4 officers listed in scrambled order with plain names:
  - Sara Chen — Specialist
  - Marcus Vance — Commander
  - Rex Thorne — Chief Engineer
  - Alena Rostova — Lieutenant Commander
- **Deduction:** The chain of command determines the order (Commander ➔ Lieutenant Commander ➔ Chief Engineer ➔ Specialist):
  - **M**arcus ➔ **A**lena ➔ **R**ex ➔ **S**ara
- **Answer:** `MARS`

### 4. Sector 4: Star Map Observatory (`starmap.html`) — ~2 minutes
- **Gate:** Enter `MARS` to unlock the observatory dish.
- **Telemetry Log Clue:** Connect stars chronologically: `[1] VEGA ➔ [2] DENEB ➔ [3] ALTAIR ➔ [4] POLARIS`.
- **Interactive Sky Dome:** Click the stars in that order. Laser alignment lines connect the constellation, an alignment sound plays, and the array reveals the final subsystem key: **`PHOBOS`**.
- **Answer:** `PHOBOS`
- **Output:** Immediately displays the official **Next Set (Set 3) Passcode**: `BEACON-7492-MARS-PHOBOS` with a one-click copy button, and provides a link to the Final Transmission Relay.

### 5. Final Transmission Relay (`transmission.html`) — Bonus / Victory Screen
- Mirrors the final box in Set 1 (`lost-found.html`).
- Displays the reversed dispatch buffer: `SOBOHP - SRAM - 2947 - NOCAEB`.
- Features an interactive reversed audio player: click `[ ⏪ PLAY REVERSED AUDIO DISPATCH ]` to play the digitized audio reverse sweep.
- Decoded in forward order: `BEACON - 7492 - MARS - PHOBOS`.

---

## 🧪 Verification & Testing
To run the automated verification suite, execute:
```powershell
powershell -ExecutionPolicy Bypass -File "mars/test.ps1"
```
Checks verified:
1. `cyrb53` hashes for all answers match expected security values.
2. All 5 files exist and contain the required clues.
3. Morse code, graph peaks, rank hierarchy, constellation sequence, and reversed strings are mathematically and visually validated.
4. Next Set master passcode hash checks out.
