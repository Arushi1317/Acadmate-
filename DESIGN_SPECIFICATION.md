# 🎨 AcadMate Design Specification - Visual Guide

## Design Concept
**"Sophisticated Student Aesthetic"** - A warm, premium, notebook-inspired dashboard that feels both professional and approachable.

---

## 🌈 Color Palette

### Primary Colors
```
Amber      #f59e0b    RGB(245, 159, 11)     Main CTA, Active states
Orange     #f97316    RGB(249, 115, 22)     Secondary highlight
```

### Accent Colors
```
Teal       #14b8a6    RGB(20, 184, 166)     Low priority, Calming
Rose/Red   #dc2626    RGB(220, 38, 38)      Urgent, Danger
Green      #22c55e    RGB(34, 197, 94)      Success, Completed
```

### Neutral Colors
```
Slate-50   #f8fafc    Very light background
Slate-100  #f1f5f9    Light backgrounds
Slate-400  #94a3b8    Light text
Slate-500  #64748b    Medium text
Slate-700  #334155    Body text
Slate-800  #1e293b    Headers
Slate-900  #0f172a    Dark text
```

---

## 📐 Sizing System

### Typography Sizes
```
Display    2.25rem (36px)    Headlines
H1         1.875rem (30px)   Page titles
H2         1.5rem (24px)     Section headers
H3         1.25rem (20px)    Subsections
Body       1rem (16px)       Default text
Small      0.875rem (14px)   Secondary text
Tiny       0.75rem (12px)    Metadata
```

### Component Sizes
```
Button Height       3rem (48px)           Comfortable tap target
Input Height        2.75rem (44px)        Comfortable to use
Icon Size           1.25rem (20px)        Standard icons
Avatar              2.5rem (40px)         Small, 4rem (64px) Large
Card Radius         1rem (16px)           rounded-2xl
Input Radius        0.75rem (12px)        rounded-xl
```

### Spacing Scale
```
XS    0.25rem (4px)
SM    0.5rem (8px)
MD    1rem (16px)
LG    1.5rem (24px)
XL    2rem (32px)
2XL   3rem (48px)
```

---

## 🎭 Component Styles

### Cards (Glass Morphism)
```
Background:  linear-gradient(135deg, 
             rgba(255, 255, 255, 0.85) 0%, 
             rgba(254, 252, 239, 0.7) 100%)
Backdrop:    blur(20px)
Border:      1px solid rgba(217, 119, 6, 0.15)
Shadow:      0 1px 3px rgba(0, 0, 0, 0.05)
Radius:      1rem (16px)

ON HOVER:
Shadow:      0 4px 12px rgba(251, 191, 36, 0.15)
Transform:   translateY(-2px)
```

### Input Fields
```
Border:      2px solid rgba(251, 191, 36, 0.5)   [Amber-200]
Background:  rgba(255, 255, 255, 0.5)
Backdrop:    blur(8px)
Radius:      0.75rem (12px)
Padding:     0.75rem 1rem (12px 16px)
Font:        500 weight, 1rem size

ON FOCUS:
Border:      2px solid rgb(251, 191, 36)         [Amber-400]
Ring:        2px ring rgba(251, 191, 36, 0.5)
Shadow:      0 0 0 3px rgba(251, 191, 36, 0.1)
```

### Buttons
```
PRIMARY BUTTON:
Background:  linear-gradient(to right, 
             rgb(245, 159, 11), rgb(249, 115, 22))
Color:       white
Padding:     0.75rem 1.5rem
Radius:      0.75rem (12px)
Font:        600 weight, 1rem size
Shadow:      0 2px 8px rgba(245, 159, 11, 0.2)

ON HOVER:
Shadow:      0 8px 16px rgba(251, 191, 36, 0.4)
Transform:   translateY(-2px)

SECONDARY BUTTON:
Background:  white
Border:      2px solid rgba(251, 191, 36, 0.5)
Color:       rgb(180, 83, 9)                    [Amber-700]
```

### Navigation Items
```
INACTIVE:
Background:  transparent
Color:       rgb(71, 85, 99)                    [Slate-600]
Font:        500 weight

ACTIVE:
Background:  linear-gradient(to right,
             rgb(245, 159, 11), rgb(249, 115, 22))
Color:       white
Font:        600 weight
Shadow:      0 4px 12px rgba(251, 191, 36, 0.3)

ON HOVER (INACTIVE):
Background:  rgba(251, 191, 36, 0.08)
Color:       rgb(180, 83, 9)
```

### Task Cards
```
Background:  linear-gradient(to right,
             rgba(255, 255, 255, 1),
             rgba(254, 252, 239, 0.3))
Border-Left: 4px solid [Priority Color]
Border-Radius: 1rem (16px)
Padding:     1rem
Shadow:      0 1px 3px rgba(0, 0, 0, 0.05)

ON HOVER:
Shadow:      0 4px 12px rgba(0, 0, 0, 0.08)
Transform:   translateY(-1px)

PRIORITY COLORS (Left Border):
- Urgent:    rgb(220, 38, 38)    [Red-600]
- High:      rgb(249, 115, 22)   [Orange-500]
- Medium:    rgb(245, 159, 11)   [Amber-500]
- Low:       rgb(20, 184, 166)   [Teal-500]
```

### Checkbox (Custom)
```
UNCHECKED:
Border:      2px solid rgba(251, 191, 36, 0.6)
Background:  white
Border-Radius: 100%

ON HOVER (UNCHECKED):
Background:  rgba(251, 191, 36, 0.1)
Border-Color: rgb(251, 191, 36)

CHECKED:
Background:  linear-gradient(135deg,
             rgb(34, 197, 94), rgb(16, 185, 129))
Border:      none
Icon:        ✓ white
```

### Priority Badges
```
LOW (Teal):
Background:  rgba(20, 184, 166, 0.15)
Border:      1px solid rgba(20, 184, 166, 0.3)
Color:       rgb(15, 118, 110)
Font:        600 weight, 0.75rem size

MEDIUM (Amber):
Background:  rgba(251, 191, 36, 0.15)
Border:      1px solid rgba(251, 191, 36, 0.3)
Color:       rgb(180, 83, 9)
Font:        600 weight, 0.75rem size

HIGH (Orange):
Background:  rgba(249, 115, 22, 0.15)
Border:      1px solid rgba(249, 115, 22, 0.3)
Color:       rgb(194, 65, 12)
Font:        600 weight, 0.75rem size

URGENT (Rose):
Background:  rgba(220, 38, 38, 0.15)
Border:      1px solid rgba(220, 38, 38, 0.3)
Color:       rgb(153, 27, 27)
Font:        600 weight, 0.75rem size
```

---

## 🎬 Animations

### Fade In
```
Duration:    0.3s - 0.4s
Easing:      ease-out
From:        opacity: 0, transform: translateY(10px)
To:          opacity: 1, transform: translateY(0)
Usage:       Page transitions, card appearances
```

### Slide In
```
Duration:    0.3s
Easing:      ease-out
From:        opacity: 0, transform: translateX(-20px)
To:          opacity: 1, transform: translateX(0)
Usage:       Task cards, modal entries
```

### Smooth Transitions
```
Duration:    0.3s
Easing:      ease-out
Properties:  All (or specific: colors, transform, shadow)
Usage:       Hover states, focus states, interactive elements
```

### Button Hover
```
Duration:    0.3s
Changes:
1. Shadow grows from 8px to 16px
2. Transform: translateY(-2px)
3. Color brightness increases slightly
```

---

## 📱 Responsive Breakpoints

```
Mobile     < 640px    Stack layout, smaller text
Tablet     640-1024px Two-column layout, medium text
Desktop    1024px+    Three-column layout, full size
```

### Responsive Adjustments
- Font sizes scale down 10-15% on mobile
- Padding reduces to 0.5rem on mobile
- Sidebar becomes hamburger menu on mobile
- Full-screen modals on mobile
- Touch targets remain 44x44px minimum

---

## 🖼️ Background Pattern

### Notebook Lines
```
Horizontal Lines:
- Pattern: Repeating linear-gradient (180deg)
- Spacing: 40px apart
- Height: 1px
- Color: rgba(209, 169, 114, 0.08)

Vertical Margins:
- Pattern: Linear gradient (90deg)
- Left margin: 0-60px
- Right margin: calc(100% - 60px) to 100%
- Color: rgba(209, 169, 114, 0.12)

Main Background:
- Color: Gradient from slate-50 via amber-50 to slate-50
- Opacity: 100% (full solid)
- Overlay: Notebook lines at 8-12% opacity
```

---

## 🎯 Visual Hierarchy

### Size Hierarchy
```
H1 (30px) > H2 (24px) > H3 (20px) > Body (16px) > Small (14px)
```

### Color Hierarchy
```
High:    Amber-500, Orange-500 (Warm, attention-getting)
Medium:  Slate-700 (Primary text)
Low:     Slate-500, Slate-400 (Secondary text)
```

### Weight Hierarchy
```
Bold (700):     Rarely used, only headlines
SemiBold (600): Headers, labels, important text
Medium (500):   Navigation, some body text
Regular (400):  Body text, descriptions
```

---

## 💫 Shadow System

### Shadow Depths
```
Level 1 (Subtle):
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.05)

Level 2 (Cards):
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.1)

Level 3 (Floating):
shadow-lg:  0 8px 16px rgba(0, 0, 0, 0.15)

Level 4 (Modals):
Uses backdrop blur instead of shadow
```

### Color-Tinted Shadows
```
Amber Glow:  0 8px 16px rgba(251, 191, 36, 0.3)
Orange Glow: 0 8px 16px rgba(249, 115, 22, 0.2)
Rose Glow:   0 8px 16px rgba(220, 38, 38, 0.2)
```

---

## 🎨 Gradient Definitions

### Button Gradient
```
linear-gradient(to right, 
  #f59e0b,  /* Amber-500 */
  #f97316   /* Orange-600 */
)
```

### Card Gradient
```
linear-gradient(135deg,
  rgba(255, 255, 255, 0.85) 0%,
  rgba(254, 252, 239, 0.7) 100%
)
```

### Background Gradient
```
linear-gradient(to bottom right,
  #f1f5f9,   /* Slate-100 */
  #fffbeb,   /* Amber-50 */
  #f1f5f9    /* Slate-100 */
)
```

### Sidebar Gradient
```
linear-gradient(180deg,
  rgba(255, 255, 255, 0.95) 0%,
  rgba(254, 252, 239, 0.85) 100%
)
```

---

## 📋 State Definitions

### Button States
```
DEFAULT:   Solid gradient, normal shadow
HOVER:     Larger shadow, slight lift
ACTIVE:    Darker shade, inset effect
DISABLED:  40% opacity, cursor not-allowed
FOCUS:     Ring outline, visible
```

### Input States
```
DEFAULT:   Amber-200 border, white background
FOCUS:     Amber-400 border, ring glow
FILLED:    Content displayed, border color
ERROR:     Rose-400 border, pink tint
DISABLED:  Gray tint, cursor not-allowed
```

### Card States
```
DEFAULT:   Flat, minimal shadow
HOVER:     Lifted, enhanced shadow
ACTIVE:    Border highlight
SELECTED:  Amber border, background tint
```

---

## 🌙 Dark Mode (Future)

### Proposed Dark Palette
```
Background:  #0f172a  (Slate-900)
Cards:       #1e293b  (Slate-800)
Text:        #f1f5f9  (Slate-100)
Accents:     Keep amber/orange (same)
```

---

## ✅ Design Consistency Checklist

- ✅ All buttons use amber-to-orange gradient
- ✅ All cards use glass morphism styling
- ✅ All inputs use amber borders with focus ring
- ✅ All badges use semi-transparent colors
- ✅ All shadows are subtle and warm-tinted
- ✅ All text hierarchy follows the system
- ✅ All spacing uses the defined scale
- ✅ All animations use smooth easing
- ✅ All colors pass WCAG contrast requirements
- ✅ Notebook pattern is consistent everywhere

---

## 📚 Design Files Reference

- CSS: `/src/index.css` - All styling rules
- Components: `/src/App.tsx` - Component implementation
- Tailwind Config: Uses Tailwind v4 with custom CSS

---

**This design system ensures a cohesive, premium, student-friendly experience across the entire AcadMate dashboard.** 🎨✨
