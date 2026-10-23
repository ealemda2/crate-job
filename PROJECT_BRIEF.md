# CrateSpace: Project Brief

This brief explains the whole project: what it is, who it serves, how it should behave,
and which questions are still open. It is written to be interrogated (via /grill-me)
and then divided into tasks. Where this brief and `CLAUDE.md` disagree, this brief is
newer; update `CLAUDE.md` once the grilling settles each question.

---

## 1. What we are building

A browser app for planning how art crates are loaded into a truck. The planner builds
a list of crates, places them inside a 3D model of the truck, and the app checks the
layout against handling rules: a clear corridor to reach the back, which crates can
carry others, what is strapped to which wall, total weight. The finished plan is
exported as a self-contained file an art handler opens on a phone or prints, and
follows step by step to load the truck and later unload it.

It runs as a static website (Vercel), works offline once loaded, and needs no account.
Saves are portable files. Google sign-in and cloud saves come later through a seam
that already exists; nothing about accounts is built now.

### Two users, two very different needs

| | The planner | The art handler |
|---|---|---|
| Who | You (and later, other registrars and shipping coordinators) | The crew at the truck, often two people |
| Where | Desk, laptop, plenty of time | Loading dock or inside the truck, gloves on, phone in hand, maybe no signal |
| Uses | The editor | Only the exported plan |
| Needs | Fast crate entry, effortless placement, rules that catch mistakes | Unambiguous order, position and orientation for each crate; nothing to interpret |

The editor exists to produce the export. The export is what actually touches the art.

---

## 2. Priorities (in order, use these to break ties)

1. **Creating and moving crates must feel effortless.** If placing a crate takes more
   than a drag and a key press, the app has failed at its main job.
2. **Rules must be easy to set and impossible to miss.** Corridor, stackable or not,
   strapped to a wall, upright only. Set once per crate type or per truck, visible
   everywhere, flagged instantly.
3. **The exported plan must be readable by a handler with no training.** A handler who
   has never seen the app should load the truck correctly from the export alone.

Everything else (stats polish, presets library, theming variants, auto-packing) is
secondary. When time is short, cut from the bottom of this list, never the top.

---

## 3. Domain primer (art shipping vocabulary)

- **Crate:** a custom wooden box built around one artwork (or a few). Has an
  inventory or crate number, a title or description, outside dimensions and a gross
  weight. Usually stenciled with "this side up" and sometimes "fragile" or
  "do not stack."
- **Upright / this side up:** most art crates must never be tipped. Paintings travel on
  edge, standing upright. The default for every crate is upright-only; only rotation
  around the vertical axis (turning it left or right) is allowed.
- **Strapping to the wall:** art trucks have rails (E-track or logistic track) along
  the walls. Tall flat crates are stood against a wall and strapped to it. A crate
  that sits against a wall is "strapped to the left wall" or "right wall."
- **Corridor:** a clear aisle, usually down the middle, so handlers can walk to the
  front of the truck and reach crates there without unloading everything in between.
- **Stacking:** some crates can carry others on top; many art crates cannot. Weight
  limits apply to whatever sits on top.
- **Door end vs. nose:** the doors are at the rear. Crates loaded first go to the nose
  (front, against the cab) and come off last.
- **Two-person lift / forklift / pallet jack:** handling notes that tell the crew what
  equipment and how many people a crate needs.

---

## 4. The end-to-end workflow

1. **Open the app.** It loads with a default truck and an empty crate list (or the
   autosaved last plan).
2. **Pick the truck.** Choose a preset (box truck, 53' trailer, etc.) or enter interior
   dimensions. Set the corridor: on or off, width, left, center or right.
3. **Enter crates.** Type shorthand, paste rows from the registrar's spreadsheet, or
   pick from the saved crate library. Each crate gets its rules (stackable, max load
   on top, upright only, handling notes).
4. **Place crates.** Drag each crate from the list into the truck. It snaps to walls,
   neighbors and the floor grid. Turn with a key. Stack by dropping onto another crate.
   Rule problems light up immediately.
5. **Review.** Stats panel: total weight, weight balance front to back and side to
   side, how much floor and space is used, any remaining warnings.
6. **Set the loading order.** The app proposes an order (nose first, bottom before
   top, wall crates before corridor-side crates). The planner can reorder.
7. **Save.** Download the plan as a file, or rely on autosave. Save the truck and
   crate types as presets for future jobs.
8. **Export for the handler.** One click produces a single file with the loading steps,
   the unloading steps, a floor map and the crate list.
9. **At the truck.** The handler opens the file on a phone (no internet needed) or
   prints it, and follows it step by step.

---

## 5. Feature areas in detail

Each area lists the behavior that matters, how we know it is done, and the open
questions for grilling.

### A. Creating crates (top priority)

**Behavior**
- **Quick-add line:** `3 C-104 "Untitled (Blue)" 72x8x56in 140lb ns 2p` creates three
  crates with that number, title, dimensions, weight, non-stackable, two-person lift.
  Units in the line are respected; anything omitted takes the defaults.
- **Paste from a spreadsheet:** paste rows (tab or comma separated) and the app maps
  columns, showing a preview before adding. Registrars live in spreadsheets; this is
  how real lists of 40 crates arrive.
- **Crate form:** a plain form for one crate at a time, for people who prefer it.
- **Duplicate:** select a crate and press a key to copy it, keeping all rules.
- **Crate library:** save a crate type to reuse across jobs (standard sizes, frequently
  shipped works). Pick from the library to add.
- **Crate types vs. placed crates:** a type holds dimensions and rules; a placed crate
  holds position, orientation and its own crate number. Several placed crates can
  share one type.

**Done when** 40 crates can be entered from a spreadsheet paste in under a minute, and
a single crate from the quick-add line in under ten seconds.

### B. Placing and moving crates (top priority)

**Behavior**
- **Drag from the list into the truck.** A ghost shows exactly where it will land
  before you let go. If the spot breaks a rule, the ghost turns the warning color.
- **Snapping:** crates click into place against walls, neighbors, the corridor edge
  and the floor grid, and the app shows clearly that they have locked in. This is
  important enough to have its own section; see B2.
- **Turning:** one key turns the selected crate a quarter turn. Upright crates can only
  turn this way; they are never tipped.
- **Stacking:** drop a crate onto another to stack it. The rules decide whether that is
  allowed (see C).
- **Fine adjustment:** arrow keys nudge by one grid step; a modifier key nudges by a
  larger step. The inspector panel shows exact position for typing numbers directly.
- **Undo and redo** for every change. Moving things around freely only feels safe
  when every move can be taken back.
- **Two views:** a 3D view to see stacking and height, and a top-down floor view that
  works like a floor plan. Dragging works the same in both. The floor view is likely
  where most placement happens.
- **Selecting:** click to select, with the crate highlighted in both the scene and the
  list. Clicking a crate in the list selects it in the truck and the other way round.

**Done when** a full truck of 20 crates can be laid out by dragging alone, without
ever needing to type a coordinate, and every action can be undone.

### B2. Snapping and lock-in verification (top priority)

The goal: a crate either sits exactly where it should or is visibly, obviously not.
There is no "looks about right." A 3D view can make a crate look flush when it is
5 cm off, so the app must never rely on the planner's eye to judge alignment.

**Make imprecision impossible to store**
- Positions are stored as whole millimeters; rotation is one of four quarter turns.
  Nothing in a saved plan can be "0.3° off" or "flush minus 2 mm by accident."
- Height is never set by the mouse. A crate rests on the floor or on the top of the
  crate beneath it, decided by the app. Dragging only ever moves a crate across a
  flat surface, so perspective can't push it up, down or sideways in depth.
- While dragging, the crate follows the pointer across the floor plane (or the top
  face of the crate under it), never free-floating in 3D space.

**Snap feel**
- Snap distance is measured on screen, not in the truck, so snapping feels the same
  zoomed in or out.
- Order of preference when several targets are in reach: touching another crate or a
  wall, then lining up with a neighbor's edge, then the corridor edge, then the grid.
- Once snapped, a crate stays snapped until the pointer moves clearly away (a larger
  release distance than capture distance), so it never jitters at the edge.
- Turning a crate keeps it against whatever it was touching. A crate on the left wall
  turned a quarter turn stays on the left wall instead of swinging into open space.
- The turn animates briefly and lands exactly on the quarter turn.
- Holding a modifier key turns snapping off for deliberate free placement (still
  whole millimeters).

**Show that it has locked in**
- **Contact highlights:** while dragging and when selected, any face touching a wall
  or another crate lights up. Flush is shown, not guessed.
- **Gap readouts:** distance labels to the nearest wall and neighbors on each side,
  like a floor plan's dimension lines. Zero reads "flush"; anything else shows the
  exact gap.
- **Alignment guides:** a line appears when a crate's edge lines up with a neighbor's
  edge, so rows of crates line up cleanly.
- **Footprint and drop line in 3D:** the crate casts its exact outline on the floor
  plus a vertical line, so its true position is readable regardless of the camera
  angle.
- **Lock-in moment:** on drop, a short settle and a solid outline confirm the crate is
  placed. The inspector shows a plain status line, for example
  "Against left wall · touching C-102 at the front · on floor · facing long side to
  wall."
- **Camera presets:** one key each for top-down, side and view from the doors, all with
  no perspective distortion, for a fast "is this square?" check. The top-down floor
  view is flat and true to scale by design.

**Catch the near misses**
- **Almost touching rule:** a gap between 1 mm and a small threshold (for example
  20 mm) between a crate and a wall or neighbor is flagged as "probably meant to be
  flush." Either close the gap or make it a real one. This catches the classic
  mistake that only shows up when the strap won't reach.
- One click on that warning closes the gap.

**Done when**
- Every stored position is a whole millimeter and every rotation a quarter turn
  (tested).
- A crate dragged against a wall from any camera angle ends up exactly flush.
- Turning a wall crate keeps it on the wall.
- Five crates dropped in a row against the left wall end up flush to each other and
  the wall, with the status line confirming each contact.
- Moving the pointer slowly near a snap target never makes the crate flicker between
  positions.

### C. Rules (top priority)

Rules never block. They warn, color the crate and explain the problem in plain words.
The planner can always know better than the software. All rules live in one place in
the code so they can be tested and extended.

| Rule | Set where | Flagged when |
|---|---|---|
| **Corridor** | Truck: on/off, width, position (left, center, right) | Any part of a crate enters the corridor |
| **Not stackable** | Crate type | Anything sits on top of it |
| **Max load on top** | Crate type | Total weight resting on it exceeds the limit |
| **Overhang** | Always on | A stacked crate is not fully supported by the one below |
| **Upright only** | Crate type (default on) | Enforced by not offering tipping at all |
| **Strapped to wall** | Detected automatically when a crate is against a wall; can be marked "free standing" instead | A tall crate (height above a set ratio to its depth) is not against a wall or braced by a neighbor |
| **Almost touching** | Always on; threshold adjustable | A crate is within a small gap of a wall or neighbor but not flush (see B2) |
| **Collision** | Always on | Two crates overlap |
| **Outside the truck** | Always on | A crate pokes through a wall, roof or door |
| **Payload** | Truck max payload | Total weight exceeds it |

The corridor is drawn in the truck as a marked lane on the floor, the way tape would
mark it on a dock floor, so it is obvious while placing.

**Done when** every rule has tests covering normal, edge and exact-fit cases, and each
flagged crate shows a one-line reason when selected.

### D. Stats and balance

Total weight against payload, weight balance front to back and side to side (shown as
a simple gauge, not a number to interpret), floor space used, space used, crate count,
warnings count. Clicking a warning selects the crate that caused it.

### E. Saving, loading and presets

- Save a plan as a file; open a file to continue. Files are the way plans are shared
  between planners for now.
- Autosave in the browser so nothing is lost on refresh; offer to restore on return.
- Presets for trucks and for crate types, built in and custom.
- Every saved file carries a version number so old plans keep opening as the app grows.
- All saving goes through one interface, so cloud saves with Google sign-in can be
  added later as just another way of saving.

### F. The handler export (top priority)

One file, opens offline on any phone or computer, prints cleanly. It contains:

1. **Cover:** job name, date, truck, crate count, total weight, corridor position, any
   warnings the planner chose to accept, and a space for the crew lead's notes.
2. **Floor map:** top-down drawing of the truck with every crate numbered by load
   order, the corridor marked, the nose and doors labeled, and the strapping walls
   shown.
3. **Loading steps:** one step per crate, in order. Each step shows:
   - Step number and crate number, large enough to read at arm's length
   - Title or description of the work
   - Dimensions and weight, in the units the crew uses
   - **Where, in plain words:** "Against the left wall, second from the nose, on the
     floor"
   - **Which way it faces:** "Long side against the wall, arrow on crate pointing up"
   - A small drawing of the truck with this crate highlighted and the crates already
     loaded shown faintly
   - Strapping: which wall, or "free standing, braced against C-102"
   - Handling notes: two-person lift, forklift, fragile, do not stack
4. **Unloading steps:** the reverse order, generated automatically, with the same
   detail.
5. **Crate list:** a table of all crates for checking against the paperwork.

On a phone, steps show one at a time with large next and back buttons and a tick box
per crate so the crew can track progress. On paper, steps flow as a printed list.
Interactive 3D in the export is a bonus, not the core; the step drawings and floor map
carry the information.

**Done when** someone who has never seen the app can load a test truck correctly from
the export alone, on a phone in airplane mode.

### G. App shell, design and hosting

- Static site on Vercel, no server code. Works offline after the first visit.
- Layout: crate list and quick-add on the left, truck view in the middle, selected
  crate details and stats on the right, file actions along the top.
- One design file holds every color, font and spacing value, used by both the panels
  and the 3D scene, so a developer can restyle everything in one place. Warning yellow
  and error red are reserved for rules and never used for decoration.
- The editor targets laptops and tablets. Phones only need the export.

---

## 6. Data model (sketch, updated for art handling)

```ts
Project {
  schemaVersion: 1
  id, name, createdAt, updatedAt
  units: "imperial" | "metric"          // display only; stored in mm and grams
  truck: {
    label
    interior: { length, width, height }  // mm
    maxPayloadG
    corridor: { enabled, width, lane: "left" | "center" | "right" }
  }
  crateTypes: [{
    id, label
    dims: { l, w, h }                    // mm
    weightG
    stackable, maxLoadOnTopG
    uprightOnly                          // default true
    handling: { people: 1 | 2 | 4, equipment?: "forklift" | "pallet-jack", fragile }
    color                                // theme token name
  }]
  placements: [{
    id
    crateTypeId
    crateNumber                          // e.g. "C-104", unique in the project
    title?                               // artwork title or description
    pos: { x, y, z }                     // mm, origin front-left floor corner
    rotation: 0 | 90 | 180 | 270         // turning only, never tipping
    support: "wall-left" | "wall-right" | "free"   // derived, can be overridden
    loadOrder                            // planner-adjustable
    notes?
  }]
}
```

---

## 7. Non-negotiables

- Keep it simple. Fewer moving parts wins every tie.
- Works offline. No feature may require a network connection.
- No accounts, users or server code now. Cloud saves come later through the existing
  save interface.
- All rules in one tested place, never inside interface components.
- All visual values in the one design file.
- Saved files are versioned; old files must always open.

---

## 8. Not now

Multiple trucks per job; automatic optimal packing (beyond a simple "fill the rest"
assist, if at all); tipping or laying crates flat; axle weight legal compliance;
physics; accounts, sign-in, sharing links; mobile editing; importing Excel files
directly (pasting rows is enough); translations.

---

## 9. Open questions for grilling

These are the decisions not yet made. Each one changes the task list.

**Crates**
1. Do some crates ever travel laid flat (for example, works on paper)? If so, is a
   per-crate "may lay flat" option worth the added complexity now?
2. Does one crate ever hold several works, needing a list of titles per crate?
3. What columns do the real registrar spreadsheets have? (A sample would settle the
   paste mapping.)
4. Are imperial units the default for the crews this serves?

**Placement**
5. Is multi-select (move a group of crates together) needed in the first version, or
   is undo plus single moves enough?
6. Should the floor view be the default view, with 3D as the check?
7. What is a sensible snap grid: 1 inch, half an inch, 25 mm?
7a. What gap counts as "almost touching": 10 mm, 20 mm, an inch? Do crews ever leave
    small deliberate gaps (for blankets or foam) that this rule would wrongly flag?
7b. Should a crate placed against a wall be marked "strapped" automatically, or should
    the planner confirm each one?
7c. Is the top-down floor view the place where most snapping happens, with 3D mainly
    for checking stacks?

**Rules**
8. Is the corridor always one straight lane from doors to nose, or does it ever need
   to bend or stop partway?
9. Should crates be strapped to each other as well as to walls (crates braced together
   as a block)?
10. What makes a crate count as "tall" for the strapping warning?
11. Are there rules about padding or blankets between crates (a minimum gap)?

**Loading and unloading**
12. Are there ever multiple stops, where unloading order is not simply the reverse of
    loading? (Currently out of scope; confirm it can stay out.)
13. Should the planner set load order by hand, or accept the proposed order and only
    adjust exceptions?

**Export**
14. Phone, paper or both as the main way the crew reads the plan?
15. Should the crew's tick boxes be saved on the phone so they survive closing the
    file?
16. Should photos of the artwork or crate appear in the export? (Adds file size and a
    way to attach images.)
17. Does the export need a signature or sign-off section for condition reporting?

**Future**
18. When cloud saves arrive, who shares with whom: planner to planner, or planner to
    crew via a link?

---

## 10. Suggested milestones (for the grilling to refine)

1. **See the truck:** app shell, design file, truck drawn from settings, hosted.
2. **Make and move crates:** crate list, quick-add, paste, drag, snap, turn, stack,
   undo, both views.
3. **Rules and stats:** every rule, warnings in the scene and list, stats panel.
4. **Save and presets:** files, autosave, versioning, truck and crate presets.
5. **Handler export:** floor map, loading and unloading steps, crate list, phone and
   print layouts, offline.
6. **Polish:** offline install, empty states, keyboard help, optional "fill the rest."

Milestones 2 and 5 carry the most weight. If either one starts to slip, take time from
4 and 6, not from them.
