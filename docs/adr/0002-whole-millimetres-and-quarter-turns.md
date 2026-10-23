# Whole millimetres, grams and quarter turns

A project stores positions and dimensions as integer millimetres, weights as integer grams, rotation as one of four quarter turns, and posture as `upright` or `flat`. Imperial is a display concern only: values are converted at the edges, and the imperial snap grid computes positions from the origin (round(n × 12.7 mm)) so repeated snapping never drifts. Nothing in a saved file can be "slightly off", and every comparison in rules is exact integer arithmetic.
