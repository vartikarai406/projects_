/**
 * AccessiNav Campus Data Model
 * Complete Node-Edge Graph for University Campus with detailed accessibility attributes
 */

window.CampusData = {
    // Campus Buildings & Points of Interest (POIs)
    buildings: [
        { id: 'b_admin', name: 'Main Administration Building', code: 'ADM', category: 'Administrative', node: 'n_admin_entrance', desc: 'University Admin, Registrar, Dean Office', icon: 'fa-building-columns' },
        { id: 'b_cse', name: 'Computer Science & Eng. Block', code: 'CSE', category: 'Academic', node: 'n_cse_ramp', desc: 'Department of CSE, AI Labs, Tech Auditorium', icon: 'fa-laptop-code' },
        { id: 'b_library', name: 'Central University Library', code: 'LIB', category: 'Academic', node: 'n_lib_entrance', desc: 'Digital Library, Study Hub, Braille Station', icon: 'fa-book-bookmark' },
        { id: 'b_student_center', name: 'Student Activity Center', code: 'SAC', category: 'Amenity', node: 'n_sac_entrance', desc: 'Food Court, ATM, Student Union, Stationery', icon: 'fa-utensils' },
        { id: 'b_eng_hub', name: 'Electrical & Mech Engineering', code: 'ENG', category: 'Academic', node: 'n_eng_entrance', desc: 'Robotics Lab, Workshop, Lecture Halls 101-108', icon: 'fa-gear' },
        { id: 'b_hostel_a', name: 'Subhash Chandra Bose Hostel (Block A)', code: 'HST-A', category: 'Residential', node: 'n_hostel_a', desc: 'Men Residence Hall, Ground Floor Ramp', icon: 'fa-bed' },
        { id: 'b_hostel_b', name: 'Kalpana Chawla Hostel (Block B)', code: 'HST-B', category: 'Residential', node: 'n_hostel_b', desc: 'Women Residence Hall, Accessible Elevator', icon: 'fa-bed' },
        { id: 'b_medical', name: 'Campus Health & Medical Center', code: 'MED', category: 'Emergency', node: 'n_med_entrance', desc: '24/7 Ambulance, Doctor Clinic, Pharmacy', icon: 'fa-kit-medical' },
        { id: 'b_auditorium', name: 'Grand University Auditorium', code: 'AUD', category: 'Amenity', node: 'n_aud_entrance', desc: '1500-seat Convention Hall, Wheelchair Seating', icon: 'fa-masks-theater' },
        { id: 'b_sports', name: 'Sports Complex & Swimming Pool', code: 'SPT', category: 'Recreation', node: 'n_sports_entrance', desc: 'Indoor Stadium, Adaptive Sports Arena', icon: 'fa-dumbbell' }
    ],

    // Accessible Amenities (POIs)
    amenities: [
        { id: 'poi_1', name: 'Accessible Restroom Ground Fl (CSE)', type: 'restroom', node: 'n_cse_ramp', details: 'Braille Signage, Motion Sensor, Grab Bars' },
        { id: 'poi_2', name: 'Accessible Restroom Ground Fl (Library)', type: 'restroom', node: 'n_lib_entrance', details: 'Wide door (95cm), Emergency Pull Switch' },
        { id: 'poi_3', name: 'Braille & Audio Assist Desk (Library)', type: 'assist', node: 'n_lib_entrance', details: 'Screen readers, Tactile Displays, Volunteers' },
        { id: 'poi_4', name: 'Elevator A (Central Library)', type: 'elevator', node: 'n_lib_elevator', details: 'Voice Announcer, Low-height Controls' },
        { id: 'poi_5', name: 'Elevator B (CSE Block)', type: 'elevator', node: 'n_cse_elevator', details: 'Wide Doors, Braille Tactile Buttons' },
        { id: 'poi_6', name: 'Medical Emergency Bay', type: 'emergency', node: 'n_med_entrance', details: 'Wheelchair Transfer Hub, 24/7 Paramedic' },
        { id: 'poi_7', name: 'Accessible Parking Slot 1', type: 'parking', node: 'n_parking_main', details: '3.5m Wide Bay, 20m to CSE Block' },
        { id: 'poi_8', name: 'Accessible Parking Slot 2', type: 'parking', node: 'n_parking_lib', details: 'Near Library Ramp Entrance' }
    ],

    // Nodes in the Campus Map Graph (x, y are relative canvas percentages 0-100)
    nodes: [
        { id: 'n_gate_main', name: 'Main Campus Gate (North)', x: 50, y: 8, type: 'gate' },
        { id: 'n_admin_entrance', name: 'Admin Block Main Plaza', x: 50, y: 22, type: 'building' },
        { id: 'n_plaza_central', name: 'Central Fountain Plaza', x: 50, y: 40, type: 'junction' },
        
        { id: 'n_cse_ramp', name: 'CSE Block Accessible Ramp', x: 25, y: 35, type: 'ramp' },
        { id: 'n_cse_stairs', name: 'CSE Block Main Stairs', x: 28, y: 38, type: 'stairs' },
        { id: 'n_cse_elevator', name: 'CSE Block Elevator Hall', x: 22, y: 32, type: 'elevator' },

        { id: 'n_lib_entrance', name: 'Library Tactile Pathway', x: 75, y: 35, type: 'tactile' },
        { id: 'n_lib_stairs', name: 'Library Front Staircase (18 steps)', x: 72, y: 38, type: 'stairs' },
        { id: 'n_lib_elevator', name: 'Library North Wing Elevator', x: 78, y: 32, type: 'elevator' },

        { id: 'n_sac_entrance', name: 'Student Center Courtyard', x: 35, y: 55, type: 'building' },
        { id: 'n_eng_entrance', name: 'Engineering Hub West Door', x: 65, y: 55, type: 'building' },

        { id: 'n_parking_main', name: 'Main Accessible Parking', x: 15, y: 20, type: 'parking' },
        { id: 'n_parking_lib', name: 'Library East Parking Bay', x: 88, y: 25, type: 'parking' },

        { id: 'n_med_entrance', name: 'Health Center Ambulance Bay', x: 82, y: 65, type: 'building' },
        { id: 'n_aud_entrance', name: 'Auditorium Ramp Portal', x: 18, y: 65, type: 'building' },

        { id: 'n_south_junction', name: 'South Residential Corridor', x: 50, y: 72, type: 'junction' },
        { id: 'n_hostel_a', name: 'Hostel Block A Entry', x: 30, y: 88, type: 'building' },
        { id: 'n_hostel_b', name: 'Hostel Block B Entry', x: 70, y: 88, type: 'building' },
        { id: 'n_sports_entrance', name: 'Sports Complex Entry', x: 50, y: 92, type: 'building' }
    ],

    // Graph Edges (Connections between nodes with physical attributes)
    edges: [
        { u: 'n_gate_main', v: 'n_admin_entrance', dist: 120, slope: 1, type: 'paved', stairs: 0, tactile: true, width: 3.5 },
        { u: 'n_admin_entrance', v: 'n_plaza_central', dist: 150, slope: 2, type: 'paved', stairs: 0, tactile: true, width: 4.0 },

        // Parking connections
        { u: 'n_parking_main', v: 'n_admin_entrance', dist: 90, slope: 1, type: 'paved', stairs: 0, tactile: false, width: 2.5 },
        { u: 'n_parking_main', v: 'n_cse_ramp', dist: 110, slope: 2, type: 'ramp', stairs: 0, tactile: true, width: 2.8 },
        { u: 'n_parking_lib', v: 'n_lib_entrance', dist: 80, slope: 1, type: 'ramp', stairs: 0, tactile: true, width: 2.5 },

        // West Pathway (Plaza to CSE)
        { u: 'n_plaza_central', v: 'n_cse_ramp', dist: 180, slope: 3, type: 'ramp', stairs: 0, tactile: true, width: 3.0 },
        { u: 'n_plaza_central', v: 'n_cse_stairs', dist: 160, slope: 8, type: 'stairs', stairs: 14, tactile: false, width: 2.5 },
        { u: 'n_cse_ramp', v: 'n_cse_elevator', dist: 40, slope: 0, type: 'corridor', stairs: 0, tactile: true, width: 2.2 },
        { u: 'n_cse_stairs', v: 'n_cse_elevator', dist: 30, slope: 0, type: 'corridor', stairs: 0, tactile: false, width: 2.0 },

        // East Pathway (Plaza to Library)
        { u: 'n_plaza_central', v: 'n_lib_entrance', dist: 190, slope: 2, type: 'tactile', stairs: 0, tactile: true, width: 3.0 },
        { u: 'n_plaza_central', v: 'n_lib_stairs', dist: 170, slope: 10, type: 'stairs', stairs: 18, tactile: false, width: 2.5 },
        { u: 'n_lib_entrance', v: 'n_lib_elevator', dist: 45, slope: 0, type: 'elevator', stairs: 0, tactile: true, width: 2.5 },
        { u: 'n_lib_stairs', v: 'n_lib_elevator', dist: 35, slope: 0, type: 'corridor', stairs: 0, tactile: false, width: 2.0 },

        // Mid Campus connections
        { u: 'n_plaza_central', v: 'n_sac_entrance', dist: 130, slope: 2, type: 'paved', stairs: 0, tactile: true, width: 3.2 },
        { u: 'n_plaza_central', v: 'n_eng_entrance', dist: 140, slope: 3, type: 'paved', stairs: 0, tactile: false, width: 3.0 },
        { u: 'n_cse_ramp', v: 'n_aud_entrance', dist: 220, slope: 4, type: 'ramp', stairs: 0, tactile: true, width: 2.8 },
        { u: 'n_sac_entrance', v: 'n_aud_entrance', dist: 150, slope: 2, type: 'paved', stairs: 0, tactile: false, width: 2.5 },

        { u: 'n_lib_entrance', v: 'n_med_entrance', dist: 210, slope: 3, type: 'tactile', stairs: 0, tactile: true, width: 3.0 },
        { u: 'n_eng_entrance', v: 'n_med_entrance', dist: 140, slope: 2, type: 'paved', stairs: 0, tactile: false, width: 2.5 },

        // South Campus connections
        { u: 'n_sac_entrance', v: 'n_south_junction', dist: 160, slope: 2, type: 'paved', stairs: 0, tactile: true, width: 3.5 },
        { u: 'n_eng_entrance', v: 'n_south_junction', dist: 160, slope: 2, type: 'paved', stairs: 0, tactile: true, width: 3.5 },
        { u: 'n_med_entrance', v: 'n_south_junction', dist: 170, slope: 3, type: 'paved', stairs: 0, tactile: false, width: 3.0 },

        { u: 'n_south_junction', v: 'n_hostel_a', dist: 180, slope: 3, type: 'ramp', stairs: 0, tactile: true, width: 2.8 },
        { u: 'n_south_junction', v: 'n_hostel_b', dist: 180, slope: 2, type: 'paved', stairs: 0, tactile: true, width: 2.8 },
        { u: 'n_south_junction', v: 'n_sports_entrance', dist: 200, slope: 1, type: 'paved', stairs: 0, tactile: true, width: 4.0 },

        { u: 'n_hostel_a', v: 'n_sports_entrance', dist: 120, slope: 1, type: 'paved', stairs: 0, tactile: false, width: 2.5 },
        { u: 'n_hostel_b', v: 'n_sports_entrance', dist: 120, slope: 1, type: 'paved', stairs: 0, tactile: false, width: 2.5 }
    ],

    // Pre-populated Temporary Barriers / Obstacles (can be updated live by users/admin)
    initialBarriers: [
        {
            id: 'bar_101',
            edgeU: 'n_plaza_central',
            edgeV: 'n_lib_stairs',
            title: 'Staircase Maintenance & Tile Repair',
            category: 'Construction',
            severity: 'blocked',
            reportedBy: 'Facility Staff',
            timestamp: 'Today, 09:15 AM',
            verified: true
        },
        {
            id: 'bar_102',
            edgeU: 'n_lib_entrance',
            edgeV: 'n_lib_elevator',
            title: 'Library North Elevator Servicing',
            category: 'Elevator Outage',
            severity: 'caution',
            reportedBy: 'Student Report #42',
            timestamp: 'Today, 11:30 AM',
            verified: false
        }
    ]
};
