# Crate Job

Laying art crates out in a truck model and sending the receiving account manager a clear summary.

## People

**Planner**:
The sender's account manager who builds the plan in the editor.
_Avoid_: User, operator

**Reader**:
The receiving account manager who reads the export.
_Avoid_: Recipient, handler, crew

## Truck

**Layout**:
A truck's interior dimensions, max payload and corridor lanes. Saved under a name as a **layout template**.
_Avoid_: Truck preset, trailer config

**Nose / doors**:
The front of the cargo space (against the cab) and the rear doors. Positions are measured from the nose.
_Avoid_: Front/back (ambiguous)

**Lane**:
A straight strip of floor kept clear: **lengthwise** (doors to nose) or **crosswise** (wall to wall). Drawn like floor tape.
_Avoid_: Aisle, corridor segment

## Crates

**Crate type**:
Dimensions, weight and rules shared by one or more crates (stackable, max load on top, upright-only or may-lay-flat, handling).
_Avoid_: Template, model

**Crate**:
One physical box in the plan: a crate number (unique), contents, its type, and its placement.
_Avoid_: Item, box, object

**Contents**:
Free text describing what is inside a crate; may list several works.
_Avoid_: Title, description

**Placement**:
Where a crate sits: position in whole millimetres from the nose-left floor corner, a quarter turn, and a posture. Height is derived (floor or the crate below), never set directly.
_Avoid_: Transform, coordinates

**Posture**:
`upright` (default) or `flat` (lying on its largest face, face up). Only crates whose type may lay flat can be flat.
_Avoid_: Tipped, rotated

**Quarter turn**:
Rotation around the vertical axis: 0, 90, 180 or 270 degrees. The only rotation there is.
_Avoid_: Angle, yaw

## Checking and sending

**Rule**:
A check on the plan that produces warnings. Rules warn and explain; they never block.
_Avoid_: Constraint, validation

**Warning**:
One rule finding on one crate, with a one-line reason.
_Avoid_: Error, flag, alert

**Unload order**:
The sequence crates come off the truck at the destination. Defaults to doors-to-nose, top before bottom; the planner reorders it.
_Avoid_: Sequence, loading order

**Export**:
The shipment summary sent to the reader: cover, floor map, crate list in unload order. PDF first, HTML second.
_Avoid_: Report, handler plan
