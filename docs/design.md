# GoCab — Mobile App Design Specification

## 1. Overview

**App Name:** GoCab  
**Platform:** iOS (iPhone — Dynamic Island variant)  
**App Type:** Ride-hailing / Transportation  
**Design Style:** Clean, card-based, modern mobility UI with a trustworthy blue accent system  

GoCab is a ride-hailing application that guides users through three primary states: vehicle selection, driver tracking, and trip completion. The design prioritises clarity, real-time feedback, and a confident, professional tone.

---

## 2. User Flow (Screen Sequence)

```
Screen 1: Find Your Vehicle
        ↓ [Find Driver]
Screen 2: Driver En Route (Live Tracking)
        ↓ [Arrival]
Screen 3: Trip Completed (Rating & Receipt)
```

---

## 3. Color System

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#2563EB` | CTA buttons, active selections, links |
| `--primary-light` | `#EFF6FF` | Selected card backgrounds |
| `--accent-blue` | `#3B82F6` | Driver arrival bar, progress indicators |
| `--success` | `#16A34A` | Coin rewards, positive indicators |
| `--warning-bg` | `#FEF9C3` | Notification banners (yellow) |
| `--danger` | `#EF4444` | Alerts, close buttons |
| `--surface` | `#FFFFFF` | Card and sheet backgrounds |
| `--bg-base` | `#F3F4F6` | App background / map overlay base |
| `--text-primary` | `#111827` | Headlines, primary labels |
| `--text-secondary` | `#6B7280` | Sub-labels, metadata |
| `--border` | `#E5E7EB` | Card borders, dividers |
| `--star-inactive` | `#D1D5DB` | Unfilled rating stars |
| `--star-active` | `#FBBF24` | Filled rating stars |

---

## 4. Typography

| Role | Font | Weight | Size | Notes |
|---|---|---|---|---|
| Screen Title | SF Pro Display | 700 | 20px | e.g. "Find your vehicle" |
| Section Label | SF Pro Text | 600 | 13px | Uppercase, tracked |
| Vehicle Name | SF Pro Text | 600 | 15px | e.g. "GoCab Medium" |
| Price | SF Pro Display | 700 | 17px | Right-aligned, primary color |
| Body / Meta | SF Pro Text | 400 | 13px | Secondary color |
| CTA Button | SF Pro Text | 700 | 16px | White on primary |
| Driver Name | SF Pro Display | 700 | 18px | Arrival screen |
| Badge Text | SF Pro Text | 600 | 11px | Pill labels |

> **Platform Note:** Use system fonts (`-apple-system, BlinkMacSystemFont`) for iOS-native feel. All text should respect Dynamic Type where applicable.

---

## 5. Screen Specifications

---

### Screen 1 — Find Your Vehicle

**Purpose:** Allow user to confirm start/destination, choose vehicle tier, select payment method, and request a driver.

#### Layout Structure

```
[ Status Bar ]
[ Back Button ]   [ Screen Title: "Find your vehicle" ]   [ Menu Icon ]
─────────────────────────────────────────────────────────────────
[ Map Preview — 35% screen height, rounded bottom corners ]
─────────────────────────────────────────────────────────────────
[ Bottom Sheet (scrollable) ]
  ├─ Route Card
  │   ├─ ● Start Location label + "Your Current Location"
  │   └─ ● Destination label + "Aloha Cafe, 4342A Marisson Hotel"
  ├─ Section Label: "Available options"
  ├─ Vehicle Option Card — SELECTED
  │   ├─ Car thumbnail (left)
  │   ├─ Name: "GoCab Medium" / Model: "Toyota HR-V • White"
  │   ├─ Capacity badge: 4
  │   └─ Price: "$23.0" (right, primary blue)
  ├─ Vehicle Option Card — UNSELECTED
  │   ├─ Car thumbnail (left)
  │   ├─ Name: "GoCab Small" / Model: "Honda Civic • White"
  │   ├─ Capacity badge: 2
  │   └─ Price: "$18.5" (right, muted)
  ├─ Section Label: "Payment Method"
  ├─ Payment Row
  │   ├─ Coin icon (yellow)
  │   ├─ "GoCab Coin" / "You have 120000 GoCab Coins"
  │   └─ Chevron (right)
  └─ [ Find Driver ] — Full-width primary button
```

#### Component Details

**Vehicle Option Card**
- Border radius: 12px
- Selected state: `--primary-light` background + `--primary` border (1.5px)
- Unselected state: white background + `--border` border
- Car image: 56×40px, object-fit contain
- Capacity badge: circular, `--bg-base` background, 20px diameter
- Height: 72px

**Route Card**
- Two rows with dot icons (filled circle = origin, outlined = destination)
- Connected by a vertical dashed line between dots
- Sub-label text: `--text-secondary`, 11px
- Main location text: `--text-primary`, 15px, semibold

**CTA Button — "Find Driver"**
- Background: `--primary`
- Border radius: 14px
- Height: 52px
- Text: white, 16px bold
- Margin: 16px horizontal, 24px bottom (safe area aware)

---

### Screen 2 — Driver En Route

**Purpose:** Show live map tracking of driver approach, display driver profile, and confirm trip details.

#### Layout Structure

```
[ Status Bar ]
[ Tab Bar: Tabs placeholder ]
─────────────────────────────────────────────────────────────────
[ Notification Banner — Yellow ]
  └─ 🚕 "Get ready, the driver will come soon"
─────────────────────────────────────────────────────────────────
[ Full-Screen Map ]
  ├─ Route polyline: blue dashed line from driver → destination
  ├─ Driver pin: car icon
  └─ Destination pin: location marker
─────────────────────────────────────────────────────────────────
[ Driver Arrival Bar — Bottom of map ]
  ├─ Car icon (left)
  ├─ "The driver will arrive in"
  └─ [ 05.21 Mins ] — Blue pill badge (right)
─────────────────────────────────────────────────────────────────
[ Driver Info Sheet ]
  ├─ Plate: "L-2323-RF" (bold, large)
  ├─ Model: "Toyota HR-V • White"
  ├─ [ Medium Size ] — Blue pill badge
  ├─ ─────── Divider ───────
  ├─ Driver Row
  │   ├─ Avatar (40px circle)
  │   ├─ Name: "Handoko Mulyono"
  │   ├─ "Top Rated Driver 🏆"
  │   ├─ Rating: ⭐ 4.5
  │   └─ [ Call ] [ Message ] icon buttons (right)
  ├─ ─────── Divider ───────
  └─ Route Summary
      ├─ ● Start Location: "Your Current Location"
      └─ ● Destination: "Aloha Cafe, 4342A Marisson Hotel"
```

#### Component Details

**Notification Banner**
- Background: `--warning-bg` (#FEF9C3)
- Full width, 44px height
- Emoji icon left, text centered
- Rounded corners: 0 (full-width edge-to-edge)

**ETA Pill**
- Background: `--primary`
- Text: white, 13px bold
- Padding: 6px 12px
- Border radius: 20px

**Driver Info Sheet**
- Bottom sheet, fixed position
- Border radius top: 20px
- Drag handle at top center (32×4px pill, `--border` color)
- Padding: 16px

**Action Icon Buttons (Call / Message)**
- Size: 40×40px circle
- Border: 1px `--border`
- Icon size: 18px
- Background: white

---

### Screen 3 — Trip Completed

**Purpose:** Confirm arrival, collect rating, display trip receipt details, and provide next actions.

#### Layout Structure

```
[ Status Bar ]
[ Back Button ]   [ "You've arrived" ]   [ Share Icon ]
─────────────────────────────────────────────────────────────────
[ Safety Banner — Blue ]
  └─ "Make sure your belongings are not left behind 🎒" [ × ]
─────────────────────────────────────────────────────────────────
[ Car + Driver Avatar ]
  ├─ Car image: centered, 140×80px
  └─ Driver avatar: 48px circle, overlapping bottom-right of car
─────────────────────────────────────────────────────────────────
[ Driver Name: "Handoko Mulyono" ]
[ Vehicle: "Toyota HR-V • L-2323-RF" ]
─────────────────────────────────────────────────────────────────
[ Trip Meta Row ]
  ├─ "Trip completed" label + GoCab#220520231636 + copy icon
  └─ "Date" label + "Monday, 22 May 2023"
─────────────────────────────────────────────────────────────────
[ Rating Section ]
  ├─ "How was your trip?"
  ├─ "(Give 1 to five stars about your trip)"
  └─ ⭐ ⭐ ⭐ ⭐ ⭐ — 5 tappable stars (inactive state default)
─────────────────────────────────────────────────────────────────
[ Trip Details Card ]
  ├─ Coins Earned: "+3023 Coins" (green badge, right)
  ├─ Pickup Location: "Airlangga University"
  ├─ Destination: "Aloha Cafe, 4342A Marisson Hotel"
  └─ Payment Method: "GoCab Coin"
─────────────────────────────────────────────────────────────────
[ Footer Buttons Row ]
  ├─ [ Back to home ] — Secondary (outline/ghost)
  └─ [ Download Bill ] — Primary (solid blue)
```

#### Component Details

**Safety Banner**
- Background: `--primary` (#2563EB)
- Text: white, 13px
- Dismissible (× button, white)
- Full width, 40px height

**Rating Stars**
- Size: 32×32px each
- Spacing: 8px gap
- Inactive: `--star-inactive`
- Active (on tap): `--star-active` with scale(1.2) animation

**Coins Earned Badge**
- Background: light green (`#DCFCE7`)
- Text: `--success` (#16A34A), 12px bold
- Border radius: 12px
- Padding: 4px 10px

**Footer Button Pair**
- Side by side, equal width
- "Back to home": white bg, `--primary` border + text
- "Download Bill": `--primary` bg, white text
- Height: 50px, border radius: 14px
- Gap: 12px

---

## 6. Spacing & Grid

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | 4px | Icon gap, tight inline spacing |
| `--space-sm` | 8px | Between label and value |
| `--space-md` | 16px | Card padding, section gap |
| `--space-lg` | 24px | Between major sections |
| `--space-xl` | 32px | Screen top padding |
| `--radius-sm` | 8px | Badges, pills |
| `--radius-md` | 12px | Cards, list items |
| `--radius-lg` | 20px | Bottom sheets, modal tops |
| `--radius-full` | 9999px | Avatars, circular buttons |

**Safe Areas:**  
- Top: Respect Dynamic Island / notch (min 54px from top edge)  
- Bottom: 34px home indicator clearance  
- Horizontal content margin: 16px

---

## 7. Iconography

| Context | Icon | Style |
|---|---|---|
| Origin dot | Filled circle | 10px, `--text-primary` |
| Destination dot | Outlined circle | 10px, `--text-primary` |
| Back navigation | Chevron left | 20px, `--text-primary` |
| Menu / options | Three dots | 20px, `--text-secondary` |
| Call driver | Phone handset | 18px, `--text-primary` |
| Message driver | Chat bubble | 18px, `--text-primary` |
| Share / export | Box with arrow up | 20px, `--text-primary` |
| Copy trip ID | Copy icon | 14px, `--primary` |
| Payment coin | Coin / token | 24px, yellow tint |
| Rating star | Star | 32px, `--star-active` / `--star-inactive` |
| Trophy / badge | Trophy | 16px, gold |

**Icon Library:** Use SF Symbols (iOS native) for all system actions. Custom icons for GoCab branding elements (coin, vehicle categories).

---

## 8. Map Component

- **Provider:** Google Maps or Mapbox (tile layer)
- **Style:** Muted/greyscale base map to allow route and pins to pop
- **Route Polyline:** `--primary` (#2563EB), 3px stroke, dashed for tracking state
- **Driver Pin:** Custom car SVG icon, 36×36px, white background with shadow
- **Destination Pin:** Standard red/blue teardrop, 28px
- **Map Controls:** Hidden (compass, zoom) — gestures only
- **Corner Radius (embedded):** 0 (full bleed) for tracking screen; 16px for preview card on Screen 1

---

## 9. Micro-interactions & Animations

| Trigger | Animation | Duration |
|---|---|---|
| Select vehicle card | Background fill + border flash | 150ms ease |
| Tap "Find Driver" button | Scale down 0.97 → release | 100ms |
| Star tap (rating) | Scale 1.0 → 1.3 → 1.0 + color fill | 200ms spring |
| ETA countdown | Number tick (CSS counter or JS) | 1s interval |
| Safety banner dismiss | Slide up + fade out | 250ms ease-out |
| Driver arrival sheet | Slide up from bottom | 300ms ease-out |
| Screen transition | Horizontal slide (push/pop) | 350ms |

---

## 10. Component States

### Button States
| State | Visual |
|---|---|
| Default | Solid primary bg |
| Pressed | 10% darker bg + scale 0.97 |
| Disabled | `--bg-base` bg + `--text-secondary` text |
| Loading | Spinner replaces text |

### Vehicle Card States
| State | Visual |
|---|---|
| Default | White bg + grey border |
| Selected | Light blue bg + primary border (1.5px) |
| Hover (focus) | Slight shadow elevation |

### Star Rating States
| State | Visual |
|---|---|
| Empty | Grey outline star |
| Filled | Gold filled star |
| Partial | Not supported (whole stars only) |

---

## 11. Accessibility

- All interactive elements: minimum 44×44px touch target
- Color contrast: all text must meet WCAG AA (4.5:1 for body, 3:1 for large text)
- VoiceOver labels on all icon-only buttons (call, message, close, copy)
- Star rating: accessible slider alternative for VoiceOver users
- Map: descriptive `accessibilityLabel` on driver pin and route
- Dynamic Type: support up to `XXL` system text size without layout breakage

---

## 12. Asset Requirements

| Asset | Format | Size | Notes |
|---|---|---|---|
| App Icon | PNG | 1024×1024px | No alpha |
| GoCab Coin Icon | SVG | 24px base | Yellow/gold fill |
| Vehicle thumbnails (Medium) | PNG | 112×80px @2x | Transparent bg |
| Vehicle thumbnails (Small) | PNG | 112×80px @2x | Transparent bg |
| Driver avatars | JPG | 80×80px @2x | Circle-cropped |
| Car top-view (Arrival screen) | PNG | 280×160px @2x | White bg or transparent |
| Map marker — driver | SVG | 36×36px | White card + shadow |
| Trophy icon | SVG | 16px | Gold |

---

## 13. Design Tokens (Summary)

```json
{
  "color": {
    "primary": "#2563EB",
    "primaryLight": "#EFF6FF",
    "accentBlue": "#3B82F6",
    "success": "#16A34A",
    "successLight": "#DCFCE7",
    "warning": "#FEF9C3",
    "surface": "#FFFFFF",
    "bgBase": "#F3F4F6",
    "textPrimary": "#111827",
    "textSecondary": "#6B7280",
    "border": "#E5E7EB",
    "starActive": "#FBBF24",
    "starInactive": "#D1D5DB"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px"
  },
  "radius": {
    "sm": "8px",
    "md": "12px",
    "lg": "20px",
    "full": "9999px"
  },
  "typography": {
    "fontFamily": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    "sizeXS": "11px",
    "sizeSM": "13px",
    "sizeMD": "15px",
    "sizeLG": "17px",
    "sizeXL": "20px"
  },
  "shadow": {
    "card": "0 1px 4px rgba(0,0,0,0.08)",
    "sheet": "0 -2px 16px rgba(0,0,0,0.12)",
    "button": "0 2px 8px rgba(37,99,235,0.3)"
  }
}
```

---

*Design Specification — GoCab v1.0 | Last updated: April 2026*
