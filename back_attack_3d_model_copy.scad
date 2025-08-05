// The Back Attack - 3D Printable Prototype Model
// OpenSCAD file for creating a functional prototype
// This creates a simplified version suitable for 3D printing

// Global parameters
$fn = 50; // Smoothness of curves

// Dimensions (in mm)
handle_length = 200;        // Base handle length
handle_diameter = 25;       // Handle grip diameter
reservoir_diameter = 40;    // Reservoir diameter
reservoir_height = 80;      // Reservoir height
extension_length = 150;     // Extension tube length
extension_diameter = 15;    // Extension tube diameter
applicator_diameter = 20;   // Applicator head diameter

// Colors for visualization
handle_color = [0.2, 0.6, 0.8];      // Blue
reservoir_color = [0.8, 0.3, 0.3];   // Red
extension_color = [0.3, 0.8, 0.3];   // Green
applicator_color = [0.8, 0.8, 0.3];  // Yellow

module main_assembly() {
    // Main handle with grip texture
    color(handle_color)
    translate([0, 0, 0])
    handle_with_grip();
    
    // Reservoir tank
    color(reservoir_color)
    translate([0, 0, handle_length])
    reservoir_tank();
    
    // Extension tube (telescoping)
    color(extension_color)
    translate([0, 0, handle_length + reservoir_height])
    extension_tube();
    
    // Applicator head
    color(applicator_color)
    translate([0, 0, handle_length + reservoir_height + extension_length])
    applicator_head();
}

module handle_with_grip() {
    difference() {
        // Main handle cylinder
        cylinder(h=handle_length, d=handle_diameter);
        
        // Grip texture (spiral grooves)
        for(i = [0:10:handle_length-20]) {
            translate([0, 0, i+10])
            rotate([0, 0, i*2])
            translate([handle_diameter/2-2, 0, 0])
            cylinder(h=8, d=3);
        }
        
        // Internal channel for tubing
        translate([0, 0, -1])
        cylinder(h=handle_length+2, d=8);
    }
    
    // Squeeze mechanism housing
    translate([0, handle_diameter/2 + 5, handle_length/2])
    squeeze_mechanism();
}

module squeeze_mechanism() {
    difference() {
        // Housing
        cube([30, 15, 60], center=true);
        
        // Internal cavity
        cube([26, 11, 56], center=true);
        
        // Squeeze button access
        translate([0, 8, 0])
        cube([20, 10, 40], center=true);
    }
    
    // Squeeze button
    translate([0, 10, 0])
    color([0.9, 0.9, 0.9])
    cube([18, 6, 35], center=true);
}

module reservoir_tank() {
    difference() {
        // Main tank body
        cylinder(h=reservoir_height, d=reservoir_diameter);
        
        // Internal cavity
        translate([0, 0, 3])
        cylinder(h=reservoir_height-6, d=reservoir_diameter-6);
        
        // Fill port
        translate([0, reservoir_diameter/2-3, reservoir_height-10])
        rotate([90, 0, 0])
        cylinder(h=10, d=8);
    }
    
    // Fill cap
    translate([0, reservoir_diameter/2+2, reservoir_height-10])
    rotate([90, 0, 0])
    color([0.5, 0.5, 0.5])
    cylinder(h=4, d=10);
    
    // Level indicator window
    translate([reservoir_diameter/2-2, 0, reservoir_height/2])
    color([0.9, 0.9, 0.9, 0.3])
    cube([2, 20, 30], center=true);
}

module extension_tube() {
    // Outer tube
    difference() {
        cylinder(h=extension_length, d=extension_diameter);
        cylinder(h=extension_length+1, d=extension_diameter-4);
    }
    
    // Inner telescoping tube
    translate([0, 0, 20])
    color([0.6, 0.8, 0.6])
    difference() {
        cylinder(h=extension_length-40, d=extension_diameter-5);
        cylinder(h=extension_length-39, d=extension_diameter-9);
    }
    
    // Extension lock mechanism
    for(i = [0:30:extension_length-30]) {
        translate([0, 0, i+15])
        rotate([0, 0, i*3])
        translate([extension_diameter/2-1, 0, 0])
        color([0.8, 0.8, 0.8])
        cube([2, 4, 8], center=true);
    }
}

module applicator_head() {
    // Base connector
    cylinder(h=10, d=extension_diameter-1);
    
    // Applicator head body
    translate([0, 0, 10])
    difference() {
        sphere(d=applicator_diameter);
        translate([0, 0, -applicator_diameter/2])
        cube([applicator_diameter+1, applicator_diameter+1, applicator_diameter], center=true);
    }
    
    // Dispensing holes
    for(angle = [0:45:315]) {
        rotate([0, 0, angle])
        translate([applicator_diameter/3, 0, 15])
        rotate([45, 0, 0])
        color([0.2, 0.2, 0.2])
        cylinder(h=3, d=2);
    }
    
    // Interchangeable head mount
    translate([0, 0, 20])
    color([0.7, 0.7, 0.7])
    cylinder(h=5, d=12);
}

// Alternative applicator heads
module rollerball_head() {
    // Rollerball housing
    difference() {
        cylinder(h=15, d=applicator_diameter);
        translate([0, 0, 5])
        sphere(d=12);
    }
    
    // Rollerball
    translate([0, 0, 10])
    color([0.9, 0.9, 0.9])
    sphere(d=10);
}

module sponge_head() {
    // Sponge holder
    difference() {
        cylinder(h=12, d=applicator_diameter);
        translate([0, 0, 2])
        cylinder(h=11, d=applicator_diameter-4);
    }
    
    // Sponge (porous texture)
    translate([0, 0, 2])
    color([1, 1, 0.7])
    difference() {
        cylinder(h=10, d=applicator_diameter-4);
        // Porous holes
        for(x = [-6:3:6]) {
            for(y = [-6:3:6]) {
                for(z = [2:3:8]) {
                    translate([x, y, z])
                    sphere(d=1.5);
                }
            }
        }
    }
}

module massager_head() {
    // Massager base
    cylinder(h=8, d=applicator_diameter);
    
    // Massage nubs
    for(angle = [0:30:330]) {
        for(radius = [4:3:8]) {
            rotate([0, 0, angle])
            translate([radius, 0, 8])
            color([0.8, 0.4, 0.8])
            sphere(d=3);
        }
    }
}

// Print layout - uncomment the parts you want to print
// Main assembly for visualization
main_assembly();

// Alternative heads positioned for printing
// translate([60, 0, 0]) rollerball_head();
// translate([60, 30, 0]) sponge_head();
// translate([60, -30, 0]) massager_head();

// Print instructions as text
module print_instructions() {
    translate([-50, -80, 0])
    color([0.2, 0.2, 0.2])
    linear_extrude(height=1)
    text("The Back Attack - 3D Print Instructions", size=6);
    
    translate([-50, -90, 0])
    color([0.2, 0.2, 0.2])
    linear_extrude(height=1)
    text("1. Print main assembly in sections", size=4);
    
    translate([-50, -96, 0])
    color([0.2, 0.2, 0.2])
    linear_extrude(height=1)
    text("2. Use flexible filament for squeeze mechanism", size=4);
    
    translate([-50, -102, 0])
    color([0.2, 0.2, 0.2])
    linear_extrude(height=1)
    text("3. Print alternative heads separately", size=4);
    
    translate([-50, -108, 0])
    color([0.2, 0.2, 0.2])
    linear_extrude(height=1)
    text("4. Assembly requires small tubing and seals", size=4);
}

// Uncomment to show print instructions
// print_instructions();

// Manufacturing notes:
// - Print orientation: Handle vertical, reservoir upright
// - Layer height: 0.2mm for good detail
// - Infill: 20% for lightweight but strong parts
// - Support: Required for squeeze mechanism overhang
// - Post-processing: Sand contact surfaces for smooth operation
// - Materials: PLA for prototype, PETG for functional version