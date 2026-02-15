# 🎮 FULL USER FLOW – COMPLETE EXPERIENCE (V1)

This document outlines the **complete user journey** for the gamified app experience, including:  
**Gameplay → Slot Machine → Rewards → XP/Levels → Avatar → Shop → Missions → Leaderboard → Sign-in Prompts → Ads Exposure**.

---

## 🚀 1. Entry

```mermaid
flowchart TD
    A[User Lands on Page] --> B[Sees: Game Grid, Coins, XP Bar, Avatar (Level 1)]
    B --> C[Clicks "Play Game"]
```

**Ads Exposure (on entry):**
- Persistent banner visible
- Optionally, pre-roll/interstitial (per ad policy)

---

## 🔄 2. Game Loop

```mermaid
flowchart TD
    D[Plays Game (30 coins)] --> E{Outcome?}
```

---

### 🏆 A) Win Path

```mermaid
flowchart TD
    F[Win] --> G[+1 Slot Token]
    G --> H[Spin Slot Machine]
    H --> I{Reward: Coins / XP / Accessory / 0 Coins}

    subgraph Level Up Flow
      J[XP Bar Fills] --> K{Level Up?}
      K -- YES --> L[Avatar Upgrade Animation]
      L --> M[Return to Game Selection]
    end
```

**Ads Exposure (win path):**
- Banner persists
- Interstitial after every X games (configurable)
- Rewarded ad available if coins are low

---

### ❌ B) Lose Path

```mermaid
flowchart TD
    N[Lose] --> O[30 Coins Already Spent]
    O --> P{Options: Play Again / Try New Game}
    P --> Q{Coins Low?}
    Q -- YES --> R[Offer: Watch Ad +50 Coins]
```

**Ads Exposure (lose path):**
- Banner persists
- Higher chance for rewarded ad prompt when coins are low
- May show interstitial after X games (not on first loss)

---

## 🎰 3. Slot Machine Sub-Loop

```mermaid
flowchart TD
    S[Win] --> T[Spin]
    T --> U[Animation (2–3 sec suspense)]
    U --> V[Reward Outcome]
    V --> W[Coin Balance Updates]
    W --> X[XP Updates]
```

**Core Psychology Loop:**  
*Game → Token → Suspense → Reward → Replay*

---

## 🧍 4. Avatar Progression

```mermaid
flowchart TD
    Y[Level Up] --> Z[Unlock Accessory Tier]
    Z --> AA[Visual Upgrade]
    AA --> AB["Next Unlock at Level X"]
```

**UX Triggers:**
- Avatar reacts when leveling up
- Store icon pulses with new available items

---

## 🛒 5. Item Shop Flow

```mermaid
flowchart TD
    AC[User Opens Shop] --> AD[Views: Available & Locked Items]
    AD --> AE[Buys Item]
    AE --> AF[Coins Deducted]
    AF --> AG[+50 XP]
    AG --> AH[Possible Level Up]
```

**Ads Exposure (shop):**
- Banner persistent
- Optional rewarded ad (discount/bonus coins, not intrusive)

---

## 📆 6. Daily & Weekly Missions

```mermaid
flowchart TD
    AI[Mission Panel Visible] --> AJ[Track: Win X, Spin X, Play X]
    AJ --> AK[Complete Mission]
    AK --> AL[Receive Coins or XP]
```

**UX Principles:**
- Progress bars always displayed
- One-click claim
- Weekly rewards are bigger and prominently shown

---

## 🏅 7. Leaderboard Flow

```mermaid
flowchart TD
    AM[After Several Games] --> AN[Leaderboard Tab/Popup]
    AN --> AO[Shows: Your Rank, 2 Above, 2 Below]
    AO --> AP["Encouragement: You're close to Top 1000!"]
```

**Ads Exposure (leaderboard):**
- Optional interstitial after closing (low frequency)

---

## 🔑 8. Sign-in Touchpoints

**First Prompt:** After the **2nd win** (post slot reward).

**Additional Prompts:**
- When winning a rare accessory
- When opening the leaderboard
- When completing weekly mission

```mermaid
flowchart TD
    AQ[Sign In] --> AR[Progress Saved]
    AR --> AS[Leaderboard Name Set]
    AS --> AT[Retention Loop Strengthens]
```

**UX Rule:** Never block early gameplay; sign-in is optional and value-focused (e.g., to “save progress”).

---

## ♻️ 9. Master Loop (Single-Screen Summary)

```mermaid
flowchart TD
    AU[Play Game] --> AV[Win → Slot Token] --> AW[Spin]
    AW --> AX[Reward] --> AY[XP Progress]
    AY --> AZ[Level Up] --> BA[Avatar Upgrade]
    BA --> BB[Shop / Missions / Leaderboard]
    BB --> AU
```

---

## 📺 10. Ads Exposure Map

Ads can appear in these locations:

- **Persistent banner:** Always shown on the hub and most screens
- **Interstitial:** Every X games (frequency can be tuned)
- **Rewarded video:** When coins are low (+50 coins bonus)
- **Shop rewarded option:** Bonus/discount (optional)
- **Interstitial after leaderboard:** Low frequency, optional

**Ad density increases if:**
- user is low on coins
- user plays for longer sessions (with frequency caps)
- user cycles games rapidly

---

## 📈 11. Engagement Phases (Levels 1–10+)

- **Phase 1 (Lv 1–3):** Game & slot, very accessible, minimal barriers
- **Phase 2 (Lv 3–6):** Avatar and shop unlock, more progression
- **Phase 3 (Lv 6–10):** Missions and leaderboard bring in competition and routine
- **Phase 4 (Lv 10+):** Full retention and optimization features, deep ecosystem

---

## ✅ Experience Summary

Users feel:

- 🎲 **Play**
- 🤩 **Suspense**
- 🏅 **Reward**
- 🚀 **Growth**
- 🧠 **Optimization**
- 🏆 **Competition**
- 💰 **Monetization Moments**