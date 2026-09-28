import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts, PDFName, PDFDict, PDFArray, PDFRef, PDFNull } from 'pdf-lib';

async function generateOperationBriefingPdf() {
  const pdfDoc = await PDFDocument.create();
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const courier = await pdfDoc.embedFont(StandardFonts.Courier);

  // Page dimensions: Standard A4 (595.28 x 841.89 pt)
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // Colors
  const navy = rgb(0.04, 0.11, 0.23); // #0B1B3A
  const darkTeal = rgb(0.06, 0.32, 0.34); // #0F5257
  const gold = rgb(0.85, 0.65, 0.13); // #D9A520
  const slateDark = rgb(0.1, 0.15, 0.25);
  const slateMuted = rgb(0.35, 0.42, 0.52);
  const lightBg = rgb(0.96, 0.97, 0.99);
  const borderGray = rgb(0.85, 0.88, 0.93);
  const redAlert = rgb(0.85, 0.15, 0.15);
  const greenActive = rgb(0.08, 0.62, 0.36);

  const pagesData = [
    {
      pageNumber: 1,
      title: 'OPERATION ALPHA',
      subtitle: 'MARITIME SECURITY & TRANSIT CORRIDOR PROTOCOL',
      section: 'Cover Page',
      badge: 'SECRET // REL TO NAVFOR',
      content: [
        { type: 'header', text: 'WESTERN NAVAL COMMAND • HEADQUARTERS MUMBAI' },
        { type: 'divider' },
        { type: 'meta', label: 'DOCUMENT ID', value: 'IN-DOC-2026-ALPHA-0842' },
        { type: 'meta', label: 'CLASSIFICATION', value: 'SECRET // AUTHORIZED NAVAL COMMAND ONLY' },
        { type: 'meta', label: 'DATE OF ISSUE', value: '27 SEPTEMBER 2026' },
        { type: 'meta', label: 'ORIGINATING UNIT', value: 'Directorate of Naval Operations (DNO), New Delhi' },
        { type: 'meta', label: 'OPERATIONAL COMMAND', value: 'Commander-in-Chief, Western Naval Command' },
        { type: 'meta', label: 'CRYPTOGRAPHIC INTEGRITY', value: 'PQC NIST FIPS 204 (ML-DSA-65) SEALED' },
        { type: 'meta', label: 'SECURITY PROTOCOL', value: 'ZERO-TRUST FORENSIC WATERMARK ACTIVE' },
        { type: 'callout', text: 'NOTICE: This operational briefing is classified. Unauthorised distribution, duplication, or transmission via non-cleared networks is strictly prohibited under the Official Secrets Act.' },
      ]
    },
    {
      pageNumber: 2,
      title: 'TABLE OF CONTENTS & PROMULGATION',
      subtitle: 'RECORD OF AMENDMENTS & DIRECTIVE STRUCTURE',
      section: 'Table of Contents',
      badge: 'SECTION 1',
      content: [
        { type: 'h2', text: '1.0 Directive Structure' },
        { type: 'toc', items: [
          { num: '1.0', title: 'Executive Summary & Strategic Mandate', page: 'Page 3' },
          { num: '2.0', title: 'Task Force 54 Organization & Command Hierarchy', page: 'Page 4' },
          { num: '3.0', title: 'Area of Operations (AOO) & Sector Coordinates', page: 'Page 5' },
          { num: '4.0', title: 'Hydrographic & Bathymetric Intelligence', page: 'Page 6' },
          { num: '5.0', title: 'Vessel Readiness & Force Allocation Matrix', page: 'Page 7' },
          { num: '6.0', title: 'Aviation & UAV Reconnaissance Corridor Plan', page: 'Page 8' },
          { num: '7.0', title: 'Subsurface Warfare & Acoustic Surveillance Protocol', page: 'Page 9' },
          { num: '8.0', title: 'Tactical Communications & Frequency Allocation', page: 'Page 10' },
          { num: '9.0', title: 'EMCON (Emission Control) RoE & Silence Matrix', page: 'Page 11' },
          { num: '10.0', title: 'Commercial Shipping Lanes & Safety Buffer Zones', page: 'Page 12' },
          { num: '11.0', title: 'Rules of Engagement (ROE) & Defensive Response Posture', page: 'Page 13' },
          { num: '12.0', title: 'Logistics, Fuel Replenishment (RAS) & Maintenance Ports', page: 'Page 14' },
          { num: '13.0', title: 'Cyber Defense & Post-Quantum Cryptographic Ledger', page: 'Page 15' },
          { num: 'Annex A', title: 'Tactical Signal Codes & Flash Message Formats', page: 'Page 16' },
          { num: 'Annex B', title: 'Contingency Base Diversion Protocols (Karwar / Goa)', page: 'Page 17' },
          { num: 'Annex C', title: 'Authorized Recipient Register & Audit Ledger', page: 'Page 18' },
        ]},
        { type: 'divider' },
        { type: 'paragraph', text: 'All units assigned to Operation Alpha shall ensure receipt acknowledgment within 4 hours of promulgation.' }
      ]
    },
    {
      pageNumber: 3,
      title: 'EXECUTIVE SUMMARY & MANDATE',
      subtitle: 'STRATEGIC OBJECTIVES & STRATEGIC CONTEXT',
      section: 'Executive Summary',
      badge: 'SECTION 2',
      content: [
        { type: 'h2', text: '2.1 Strategic Context' },
        { type: 'paragraph', text: 'In accordance with Western Fleet Operational Order 042/26, Task Force 54 is deployed to maintain continuous surveillance, freedom of navigation, and maritime sovereignty across the Eastern Arabian Sea corridor. Heightened regional maritime activity requires reinforced presence along the 200 NM Exclusive Economic Zone (EEZ).' },
        { type: 'h2', text: '2.2 Primary Mission Objectives' },
        { type: 'bullet', text: '1. Establish an impenetrable multi-layer surface and subsurface screening cordon around merchant transit channels.' },
        { type: 'bullet', text: '2. Enforce strict Emission Control (EMCON Alpha) along sensitive tactical corridors to deny electronic signal exploitation.' },
        { type: 'bullet', text: '3. Maintain real-time cryptographic audit trail of all distributed operational intelligence using post-quantum verifiable credentials.' },
        { type: 'bullet', text: '4. Integrate shore-based coastal radar with airborne UAV continuous synthetic aperture radar (SAR) coverage.' },
        { type: 'callout', text: 'STRATEGIC DIRECTIVE: Zero compromise on cryptographic chain-of-custody. Any leaked physical or electronic brief shall be traced immediately via forensic watermark lineage.' }
      ]
    },
    {
      pageNumber: 4,
      title: 'TASK FORCE 54 ORGANIZATION',
      subtitle: 'FLEET COMPOSITION & COMMAND HIERARCHY',
      section: 'Command Structure',
      badge: 'SECTION 3',
      content: [
        { type: 'h2', text: '3.1 Task Force Composition' },
        { type: 'table', headers: ['Unit Name', 'Callsign', 'Role / Class', 'Commanding Officer'], rows: [
          ['INS Vikramaditya (R33)', 'VIKRAM-ALPHA', 'Carrier Strike Flagship', 'Capt. R. Deshmukh, VSM'],
          ['INS Visakhapatnam (D66)', 'SENTINEL-BRAVO', 'Guided Missile Destroyer', 'Capt. V. K. Nair'],
          ['INS Mormugao (D67)', 'PATROL-CHARLIE', 'Guided Missile Destroyer', 'Capt. A. Sengupta'],
          ['INS Khanderi (S22)', 'HUNTER-ZULU', 'Attack Submarine (SSK)', 'Cdr. S. Ramanathan'],
          ['UAV Squad Alpha-03', 'DRONE-ALPHA', 'Long-Range Surveillance', 'Lt. Cdr. M. Farooq'],
          ['FIC-04 Squadron', 'INTERCEPT-04', 'Fast Interceptor Craft', 'Lt. P. K. Sharma'],
        ]},
        { type: 'h2', text: '3.2 Command Channels' },
        { type: 'paragraph', text: 'Operational command resides with Flag Officer Commanding Western Fleet (FOCWF), embarked onboard INS Vikramaditya. Secondary tactical command is delegated to INS Visakhapatnam in the event of EMCON Alpha signal isolation.' }
      ]
    },
    {
      pageNumber: 5,
      title: 'AREA OF OPERATIONS & SECTORS',
      subtitle: 'GEOGRAPHIC BOUNDARIES & PATROL BOXES',
      section: 'Area of Operations',
      badge: 'SECTION 4',
      content: [
        { type: 'h2', text: '4.1 Tactical Sector Coordinates' },
        { type: 'table', headers: ['Sector Designation', 'North-West Bound', 'South-East Bound', 'Assigned Primary Unit'], rows: [
          ['Sector Alpha (Outer)', '19°30\'N, 71°45\'E', '18°15\'N, 72°30\'E', 'INS Vikramaditya (R33)'],
          ['Sector Bravo (Approach)', '19°05\'N, 72°20\'E', '18°40\'N, 72°50\'E', 'INS Visakhapatnam (D66)'],
          ['Sector Charlie (Transit)', '18°35\'N, 72°30\'E', '17°10\'N, 73°10\'E', 'INS Mormugao (D67)'],
          ['Box Zulu (Subsurface)', '17°50\'N, 72°15\'E', '17°10\'N, 72°50\'E', 'INS Khanderi (S22)'],
          ['Air Corridor Delta', '19°45\'N, 72°10\'E', '19°10\'N, 72°55\'E', 'UAV-Alpha-03 Surveillance'],
        ]},
        { type: 'callout', text: 'NAVIGATION ADVISORY: All naval vessels shall maintain minimum 5 NM standoff from designated commercial offshore gas production platforms.' }
      ]
    },
    {
      pageNumber: 6,
      title: 'HYDROGRAPHIC & ACOUSTIC INTEL',
      subtitle: 'BATHYMETRY & THERMAL LAYER PROFILE',
      section: 'Hydrographic Intel',
      badge: 'SECTION 5',
      content: [
        { type: 'h2', text: '5.1 Arabian Sea Bathymetric Contours' },
        { type: 'paragraph', text: 'The continental shelf extends approximately 80 NM westward from Mumbai coastline before dropping steeply past the 200m isobath to abyssal depths exceeding 2,500m. This gradient creates distinct acoustic propagation zones.' },
        { type: 'h2', text: '5.2 Sound Velocity Profile (SVP)' },
        { type: 'bullet', text: '• Surface Duct Layer: 0 - 45 meters (Temp 28.5°C, sound speed 1542 m/s).' },
        { type: 'bullet', text: '• Thermocline Zone: 45 - 180 meters (Rapid sound velocity decrease to 1498 m/s).' },
        { type: 'bullet', text: '• Deep Sound Channel (SOFAR Axis): Below 800 meters (Optimal long-range acoustic detection).' },
        { type: 'callout', text: 'ACOUSTIC ADVANTAGE: Subsurface unit INS Khanderi is advised to patrol below the 60m thermocline boundary to evade surface active sonar detection.' }
      ]
    },
    {
      pageNumber: 7,
      title: 'VESSEL READINESS MATRIX',
      subtitle: 'MATERIEL READINESS, FUEL & WEAPONS STATE',
      section: 'Vessel Readiness',
      badge: 'SECTION 6',
      content: [
        { type: 'h2', text: '6.1 Fleet Readiness Status (B-24 Hour Audit)' },
        { type: 'table', headers: ['Unit', 'Displacement', 'Propulsion State', 'Fuel (F-76)', 'Weapons Readiness'], rows: [
          ['INS Vikramaditya', '45,400 tonnes', '100% Operational', '94% Full', 'MiG-29K Combat Ready (16 airframes)'],
          ['INS Visakhapatnam', '7,400 tonnes', '100% Operational', '88% Full', 'BrahMos + Barak-8 (Full loadout)'],
          ['INS Mormugao', '7,400 tonnes', '100% Operational', '91% Full', 'BrahMos + Barak-8 (Full loadout)'],
          ['INS Khanderi', '1,775 tonnes', '100% Operational', '98% Battery', 'Varunastra Heavy Torpedoes ready'],
          ['FIC-04 Squadron', '45 tonnes', 'Twin Waterjets 100%', '95% Full', '12.7mm HMG + Spike Missiles'],
        ]},
        { type: 'paragraph', text: 'All propulsion and combat management suites are certified by Naval Dockyard Mumbai quality assurance inspection teams.' }
      ]
    },
    {
      pageNumber: 8,
      title: 'AVIATION & UAV FLIGHT PLAN',
      subtitle: 'RECONNAISSANCE CORRIDORS & AEW PATROLS',
      section: 'Aviation Plan',
      badge: 'SECTION 7',
      content: [
        { type: 'h2', text: '7.1 Air Surveillance Schedule' },
        { type: 'paragraph', text: 'Continuous airborne maritime domain awareness will be maintained through synchronised UAV and fixed-wing sorties from INS Hansa (Goa) and carrier air wing.' },
        { type: 'table', headers: ['Air Asset', 'Mission Profile', 'Altitude', 'Loiter Endurance', 'Data Link'], rows: [
          ['UAV-Alpha-03', 'Maritime Radar Sweep', 'FL 240 (24,000 ft)', '14.5 Hours', 'PQC Encrypted DDL (C-Band)'],
          ['Kamov Ka-31', 'Airborne Early Warning', 'FL 120 (12,000 ft)', '3.2 Hours', 'Link-II Tactical Mesh'],
          ['P-8I Neptune', 'Long Range ASW / C4I', 'FL 310 (31,000 ft)', '8.0 Hours', 'SATCOM Ku-Band Encrypted'],
        ]},
        { type: 'callout', text: 'AIR DEFENSE INTEGRATION: Friendly air assets shall squawk Mode 5 Level 2 IFF cryptography at all times within the Western Fleet Air Defense Identification Zone.' }
      ]
    },
    {
      pageNumber: 9,
      title: 'SUBSURFACE WARFARE & ACOUSTICS',
      subtitle: 'PASSIVE SURVEILLANCE & BUOY GRID',
      section: 'Subsurface Plan',
      badge: 'SECTION 8',
      content: [
        { type: 'h2', text: '8.1 Anti-Submarine Warfare (ASW) Screen' },
        { type: 'paragraph', text: 'Subsurface surveillance architecture employs a hybrid passive hydrophone array tethered along the continental shelf edge, supported by tactical sonobuoy fields deployed by maritime patrol aircraft.' },
        { type: 'h2', text: '8.2 Acoustic Sonobuoy Fields' },
        { type: 'bullet', text: '• Pattern Alpha-Echo: 12x DIFAR passive buoys deployed along 72°30\'E meridian.' },
        { type: 'bullet', text: '• Pattern Bravo-Zulu: 8x VLAD deep-water acoustic buoys covering Mumbai approach canyon.' },
        { type: 'bullet', text: '• Acoustic Intercept Log: Monitored 24/7 by Western Fleet Acoustic Intelligence Center (AIC).' },
        { type: 'callout', text: 'RADIO SILENCE NOTICE: INS Khanderi shall not break surface or radiate electromagnetic signals unless receiving coded VLF burst priority 1 emergency dispatch.' }
      ]
    },
    {
      pageNumber: 10,
      title: 'TACTICAL COMMS ARCHITECTURE',
      subtitle: 'POST-QUANTUM FREQUENCY ALLOCATIONS',
      section: 'Comms Architecture',
      badge: 'SECTION 9',
      content: [
        { type: 'h2', text: '9.1 Multi-Band Naval Communications Matrix' },
        { type: 'table', headers: ['Band / System', 'Frequency Range', 'Primary Usage', 'Cryptographic Standard'], rows: [
          ['EHF MilSat (GSAT-7)', '44.0 - 46.0 GHz', 'Fleet Command Uplink', 'NIST ML-KEM-768 / FIPS 203'],
          ['SHF Link-II Mesh', '7.25 - 8.40 GHz', 'Inter-Ship Tactical Data', 'AES-256-GCM + PQC Kyber'],
          ['VHF Marine Tactical', '156.0 - 174.0 MHz', 'Close Formation Maneuver', 'Secured Frequency Hopping'],
          ['VLF Subsurface', '16.0 - 24.0 kHz', 'Submarine Emergency Order', 'One-Time Pad Acoustic'],
        ]},
        { type: 'paragraph', text: 'All primary and secondary data streams are signed with ML-DSA-65 post-quantum zero-trust credentials.' }
      ]
    },
    {
      pageNumber: 11,
      title: 'EMISSION CONTROL (EMCON) ROE',
      subtitle: 'RADIO SILENCE MATRIX & SIGNATURE CONTROL',
      section: 'EMCON Rules',
      badge: 'SECTION 10',
      content: [
        { type: 'h2', text: '10.1 EMCON Operational States' },
        { type: 'table', headers: ['State', 'Radar / Active RF', 'Radio / Voice', 'Satellite Uplink', 'Tactical Posture'], rows: [
          ['EMCON Alpha', 'COMPLETELY SILENT', 'SILENT (Rx Only)', 'SILENT (Rx Only)', 'Full Stealth / Denied Environment'],
          ['EMCON Bravo', 'Directional LPI Only', 'Coded Burst Only', 'Scheduled Bursts', 'Restricted Tactical Transit'],
          ['EMCON Charlie', 'Active Radar 3D Sweep', 'Encrypted Voice OK', 'Continuous Uplink', 'Standard Peacetime Escort'],
        ]},
        { type: 'callout', text: 'INCIDENT PROTOCOL: If any vessel experiences unintended RF radiation during EMCON Alpha, an automatic telemetry breach incident report is submitted to Fleet HQ ledger.' }
      ]
    },
    {
      pageNumber: 12,
      title: 'COMMERCIAL SHIPPING MANAGEMENT',
      subtitle: 'TRANSIT CORRIDORS & BUFFER PROTOCOLS',
      section: 'Shipping Corridors',
      badge: 'SECTION 11',
      content: [
        { type: 'h2', text: '11.1 De-confliction with Commercial Marine Traffic' },
        { type: 'paragraph', text: 'Over 14,000 commercial cargo, container, and tanker vessels transit the Western Indian seaboard annually. Clear separation protocols ensure civilian maritime traffic remains undisturbed while tactical operations proceed.' },
        { type: 'h2', text: '11.2 Safety Buffer Parameters' },
        { type: 'bullet', text: '• Commercial Traffic Separation Scheme (TSS): Minimum 3 NM lateral separation for task group vessels.' },
        { type: 'bullet', text: '• Offshore Oil & Gas Platforms: Strict 500m UNCLOS safety zone enforced with 2 NM radar screening.' },
        { type: 'bullet', text: '• JNPT / Mumbai Port Approach: Coordinated with Mumbai Vessel Traffic Management System (VTMS).' }
      ]
    },
    {
      pageNumber: 13,
      title: 'RULES OF ENGAGEMENT (ROE)',
      subtitle: 'GRADUATED DEFENSIVE RESPONSE POSTURE',
      section: 'Rules of Engagement',
      badge: 'SECTION 12',
      content: [
        { type: 'h2', text: '12.1 Graduated Escalation Ladder' },
        { type: 'table', headers: ['Level', 'Threat Threshold', 'Authorized Defensive Measure', 'Command Approval Required'], rows: [
          ['Tier 1', 'Unidentified vessel within 15 NM', 'Radar illumination, VHF challenge', 'Officer of the Watch (OOW)'],
          ['Tier 2', 'Non-responsive within 8 NM', 'Acoustic hailing, Warning flares', 'Executive Officer / Captain'],
          ['Tier 3', 'Aggressive maneuvering < 3 NM', 'Warning shots across bow', 'Flag Officer Commanding Fleet'],
          ['Tier 4', 'Hostile intent / Imminent attack', 'Kinetic neutralization of weapon', 'National Command Authority'],
        ]},
        { type: 'callout', text: 'SOVEREIGN MANDATE: Hostile action against Indian flag vessels within territorial waters shall be met with proportionate self-defense under Article 51 of UN Charter.' }
      ]
    },
    {
      pageNumber: 14,
      title: 'LOGISTICS & FLEET REPLENISHMENT',
      subtitle: 'RAS STATIONS, MAINTENANCE & FUEL SUPPLY',
      section: 'Logistics Plan',
      badge: 'SECTION 13',
      content: [
        { type: 'h2', text: '13.1 Replenishment At Sea (RAS) Schedule' },
        { type: 'paragraph', text: 'Fleet tanker INS Deepak (A50) will execute liquid and solid replenishment at designated underway rendezvous points every 72 hours.' },
        { type: 'table', headers: ['RAS Station', 'Rendezvous Coordinates', 'Primary Customer', 'Supplies Transferred'], rows: [
          ['Point Romeo-1', '18°45\'N, 72°15\'E', 'INS Vikramaditya (R33)', 'Aviation Fuel (Avcat), F-76, Rations'],
          ['Point Romeo-2', '18°10\'N, 72°35\'E', 'INS Visakhapatnam & Mormugao', 'Diesel F-76, Fresh Water, Spares'],
          ['Emergency Port 1', 'INS Kadamba (Karwar Base)', 'All Surface Units', 'Deep-water berths, Munitions depot'],
          ['Emergency Port 2', 'Mormugao Enclave (Goa)', 'Fast Interceptor Craft', 'Rapid turnaround, engine refit'],
        ]}
      ]
    },
    {
      pageNumber: 15,
      title: 'CYBER DEFENSE & PQC LEDGER',
      subtitle: 'ZERO-TRUST FORENSIC PROVENANCE ENGINE',
      section: 'Cyber Defense',
      badge: 'SECTION 14',
      content: [
        { type: 'h2', text: '14.1 Zero-Trust Architecture & Cryptographic Provenance' },
        { type: 'paragraph', text: 'NAV-TRAC X provides cryptographic defense against physical leak extraction and unauthorized brief duplication. Each distributed briefing package is watermarked steganographically at the server layer prior to recipient rendering.' },
        { type: 'h2', text: '14.2 Cryptographic Key Specifications' },
        { type: 'bullet', text: '• Post-Quantum Key Encapsulation: NIST ML-KEM-768 (Kyber) for payload transit encryption.' },
        { type: 'bullet', text: '• Post-Quantum Digital Signature: NIST ML-DSA-65 (Dilithium) for immutable tamper audit.' },
        { type: 'bullet', text: '• Hash Chain Topology: Merkle-tree structured immutable audit blocks replicated across 6 command nodes.' },
        { type: 'callout', text: 'AUDIT COMPLIANCE: Every document open, decrypt, print, and export event is committed as an immutable block on the naval ledger.' }
      ]
    },
    {
      pageNumber: 16,
      title: 'ANNEX A: TACTICAL SIGNAL CODES',
      subtitle: 'RAPID FLASH MESSAGE & BREVITY CODES',
      section: 'Annex A',
      badge: 'ANNEX A',
      content: [
        { type: 'h2', text: 'A.1 Fleet Brevity Code Glossary' },
        { type: 'table', headers: ['Code Word', 'Operational Meaning', 'Action Required by Units'], rows: [
          ['FLASH ALPHA', 'EMCON radio silence enforced immediately', 'Shut down non-essential transmitters'],
          ['RADAR DARK', 'Surveillance radar switch to silent passive', 'Activate optronic infrared sensors'],
          ['BLUE SHIELD', 'All crypto keys rotated to next epoch', 'Confirm PQC certificate handshake'],
          ['VIPER STRIKE', 'Unidentified fast surface contact detected', 'Deploy UAV thermal tracking'],
          ['SANCTUARY', 'Proceed to emergency diversion base', 'Acknowledge via VLF beacon'],
        ]}
      ]
    },
    {
      pageNumber: 17,
      title: 'ANNEX B: CONTINGENCY DIVERSION',
      subtitle: 'PROJECT SEABIRD KARWAR & GOA ENCLAVE',
      section: 'Annex B',
      badge: 'ANNEX B',
      content: [
        { type: 'h2', text: 'B.1 Project Seabird (Karwar) Facilities' },
        { type: 'paragraph', text: 'INS Kadamba Karwar serves as the strategic deep-water refuge base for capital ships with covered submarine dry-docks, underground munitions bunkers, and independent tactical communications grid.' },
        { type: 'h2', text: 'B.2 Emergency Entry Coordinates' },
        { type: 'bullet', text: '• Fairway Channel Buoy: 14°48\'30"N, 74°06\'15"E (Channel depth 13.5m CD).' },
        { type: 'bullet', text: '• Harbor Control VTS: Calling Channel 12 VHF (Encrypted Tactical).' },
        { type: 'bullet', text: '• Medical Facility: INHS Patanjali 150-bed tertiary trauma care.' }
      ]
    },
    {
      pageNumber: 18,
      title: 'ANNEX C: DISTRIBUTION & AUDIT',
      subtitle: 'AUTHORIZED RECIPIENT ROSTER & SECURITY CLEARANCE',
      section: 'Annex C',
      badge: 'ANNEX C',
      content: [
        { type: 'h2', text: 'C.1 Authorized Recipient Register' },
        { type: 'table', headers: ['Recipient Rank & Name', 'Unit / Command', 'Clearance Level', 'Access Mode'], rows: [
          ['Cdr. Arjun Mehta', 'Directorate of Naval Operations', 'Level 4 (Top Secret)', 'Full Authorization'],
          ['Lt. Cdr. Sunita Rao', 'Western Naval Command (HQ)', 'Level 4 (Top Secret)', 'Full Authorization'],
          ['Lt. Priya Singh', 'Eastern Fleet Intelligence', 'Level 3 (Secret)', 'View Only (Secure)'],
          ['Capt. V. K. Nair', 'INS Visakhapatnam (D66)', 'Level 4 (Top Secret)', 'Full Authorization'],
          ['Capt. A. Sengupta', 'INS Mormugao (D67)', 'Level 4 (Top Secret)', 'Full Authorization'],
          ['Cdr. S. Ramanathan', 'INS Khanderi (S22)', 'Level 4 (Top Secret)', 'EMCON Air-Gapped'],
        ]},
        { type: 'callout', text: 'END OF BRIEFING: Document comprises 18 numbered pages. Recipient copy cryptographic hash: 7e9f3b2a4c6d8e1f0b5a... (SHA3-256). All rights reserved Indian Navy.' }
      ]
    }
  ];

  // Render all 18 pages with rich layouts
  for (let i = 0; i < pagesData.length; i++) {
    const data = pagesData[i];
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Background
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: lightBg,
    });

    // Outer framing border
    page.drawRectangle({
      x: 24,
      y: 24,
      width: pageWidth - 48,
      height: pageHeight - 48,
      borderColor: borderGray,
      borderWidth: 1.5,
      color: rgb(1, 1, 1),
    });

    // Top Header Banner
    page.drawRectangle({
      x: 24,
      y: pageHeight - 75,
      width: pageWidth - 48,
      height: 51,
      color: navy,
    });

    // Top Header Text
    page.drawText('INDIAN NAVY • NAVAL TACTICAL NETWORK', {
      x: 40,
      y: pageHeight - 50,
      size: 11,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    page.drawText('NAV-TRAC X SECURE DEFENSE BRIEFING', {
      x: 40,
      y: pageHeight - 65,
      size: 8.5,
      font: helvetica,
      color: gold,
    });

    // Classification Badge (Top Right)
    page.drawRectangle({
      x: pageWidth - 195,
      y: pageHeight - 68,
      width: 155,
      height: 24,
      color: rgb(0.85, 0.15, 0.15),
    });
    page.drawText('SECRET // NOFORN', {
      x: pageWidth - 180,
      y: pageHeight - 56,
      size: 9.5,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    // Page Title Section
    let currentY = pageHeight - 110;

    page.drawText(data.title, {
      x: 45,
      y: currentY,
      size: 18,
      font: helveticaBold,
      color: navy,
    });
    currentY -= 16;

    page.drawText(data.subtitle, {
      x: 45,
      y: currentY,
      size: 10,
      font: helveticaBold,
      color: darkTeal,
    });
    currentY -= 12;

    // Divider
    page.drawLine({
      start: { x: 45, y: currentY },
      end: { x: pageWidth - 45, y: currentY },
      thickness: 1.5,
      color: borderGray,
    });
    currentY -= 20;

    // Content renderer
    for (const item of data.content) {
      if (item.type === 'header') {
        page.drawText(item.text, {
          x: 45,
          y: currentY,
          size: 11,
          font: helveticaBold,
          color: darkTeal,
        });
        currentY -= 18;
      } else if (item.type === 'title') {
        page.drawText(item.text, {
          x: 45,
          y: currentY,
          size: 24,
          font: helveticaBold,
          color: navy,
        });
        currentY -= 26;
      } else if (item.type === 'subtitle') {
        page.drawText(item.text, {
          x: 45,
          y: currentY,
          size: 12,
          font: helvetica,
          color: slateMuted,
        });
        currentY -= 20;
      } else if (item.type === 'divider') {
        page.drawLine({
          start: { x: 45, y: currentY },
          end: { x: pageWidth - 45, y: currentY },
          thickness: 1,
          color: borderGray,
        });
        currentY -= 18;
      } else if (item.type === 'h2') {
        page.drawText(item.text, {
          x: 45,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: navy,
        });
        currentY -= 16;
      } else if (item.type === 'paragraph') {
        // Multi-line word wrap
        const words = item.text.split(' ');
        let line = '';
        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          if (testLine.length > 85) {
            page.drawText(line, { x: 45, y: currentY, size: 9.5, font: timesRoman, color: slateDark });
            currentY -= 14;
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) {
          page.drawText(line, { x: 45, y: currentY, size: 9.5, font: timesRoman, color: slateDark });
          currentY -= 16;
        }
      } else if (item.type === 'bullet') {
        page.drawText(item.text, {
          x: 55,
          y: currentY,
          size: 9.5,
          font: timesRoman,
          color: slateDark,
        });
        currentY -= 15;
      } else if (item.type === 'meta') {
        page.drawText(`${item.label}:`, {
          x: 45,
          y: currentY,
          size: 9.5,
          font: helveticaBold,
          color: darkTeal,
        });
        page.drawText(item.value, {
          x: 190,
          y: currentY,
          size: 9.5,
          font: courier,
          color: navy,
        });
        currentY -= 16;
      } else if (item.type === 'callout') {
        page.drawRectangle({
          x: 45,
          y: currentY - 30,
          width: pageWidth - 90,
          height: 38,
          color: rgb(0.98, 0.95, 0.90),
          borderColor: rgb(0.90, 0.75, 0.40),
          borderWidth: 1,
        });
        page.drawText(item.text.slice(0, 105), {
          x: 55,
          y: currentY - 14,
          size: 8.5,
          font: helveticaBold,
          color: rgb(0.55, 0.35, 0.05),
        });
        if (item.text.length > 105) {
          page.drawText(item.text.slice(105), {
            x: 55,
            y: currentY - 25,
            size: 8.5,
            font: helvetica,
            color: rgb(0.55, 0.35, 0.05),
          });
        }
        currentY -= 48;
      } else if (item.type === 'toc' && item.items) {
        for (const tocItem of item.items) {
          page.drawText(tocItem.num, { x: 45, y: currentY, size: 9, font: helveticaBold, color: darkTeal });
          page.drawText(tocItem.title, { x: 100, y: currentY, size: 9, font: timesRoman, color: slateDark });
          page.drawText(tocItem.page, { x: pageWidth - 100, y: currentY, size: 9, font: courier, color: navy });
          page.drawLine({
            start: { x: 380, y: currentY - 2 },
            end: { x: pageWidth - 110, y: currentY - 2 },
            thickness: 0.5,
            color: borderGray,
          });
          currentY -= 15;
        }
        currentY -= 10;
      } else if (item.type === 'table' && item.headers && item.rows) {
        const colWidth = (pageWidth - 90) / item.headers.length;
        // Table Header
        page.drawRectangle({
          x: 45,
          y: currentY - 14,
          width: pageWidth - 90,
          height: 18,
          color: darkTeal,
        });
        for (let c = 0; c < item.headers.length; c++) {
          page.drawText(item.headers[c], {
            x: 50 + c * colWidth,
            y: currentY - 10,
            size: 8.5,
            font: helveticaBold,
            color: rgb(1, 1, 1),
          });
        }
        currentY -= 20;

        // Table Rows
        for (let r = 0; r < item.rows.length; r++) {
          const rowBg = r % 2 === 0 ? rgb(0.97, 0.98, 1.0) : rgb(1, 1, 1);
          page.drawRectangle({
            x: 45,
            y: currentY - 14,
            width: pageWidth - 90,
            height: 18,
            color: rowBg,
            borderColor: borderGray,
            borderWidth: 0.5,
          });
          for (let c = 0; c < item.rows[r].length; c++) {
            page.drawText(item.rows[r][c].slice(0, 32), {
              x: 50 + c * colWidth,
              y: currentY - 10,
              size: 8,
              font: c === 0 ? helveticaBold : timesRoman,
              color: slateDark,
            });
          }
          currentY -= 18;
        }
        currentY -= 10;
      }
    }

    // Bottom Footer
    page.drawLine({
      start: { x: 24, y: 50 },
      end: { x: pageWidth - 24, y: 50 },
      thickness: 1,
      color: borderGray,
    });

    page.drawText('NAV-TRAC X • PQC VERIFIABLE AUDIT LEDGER', {
      x: 40,
      y: 35,
      size: 8,
      font: helvetica,
      color: slateMuted,
    });

    page.drawText(`PAGE ${data.pageNumber} OF 18`, {
      x: pageWidth / 2 - 35,
      y: 35,
      size: 9,
      font: courier,
      color: navy,
    });

    page.drawText('SECRET // RESTRICTED', {
      x: pageWidth - 145,
      y: 35,
      size: 8,
      font: helveticaBold,
      color: redAlert,
    });
  }

  // Create standard PDF outlines (bookmarks) for Outline navigation
  const pageRefs = pdfDoc.getPages().map((p) => p.ref);
  const context = pdfDoc.context;

  // Build Outline Item Objects
  const outlines = [
    { title: 'Cover Page', pageIndex: 0 },
    { title: '1.0 Table of Contents & Promulgation', pageIndex: 1 },
    { title: '2.0 Executive Summary & Strategic Mandate', pageIndex: 2 },
    { title: '3.0 Task Force 54 Organization', pageIndex: 3 },
    { title: '4.0 Area of Operations & Sectors', pageIndex: 4 },
    { title: '5.0 Hydrographic & Acoustic Intelligence', pageIndex: 5 },
    { title: '6.0 Vessel Readiness & Force Allocation', pageIndex: 6 },
    { title: '7.0 Aviation & UAV Surveillance Plan', pageIndex: 7 },
    { title: '8.0 Subsurface Warfare & Acoustic Grid', pageIndex: 8 },
    { title: '9.0 Tactical Communications Architecture', pageIndex: 9 },
    { title: '10.0 Emission Control (EMCON) RoE', pageIndex: 10 },
    { title: '11.0 Commercial Shipping Management', pageIndex: 11 },
    { title: '12.0 Rules of Engagement (ROE)', pageIndex: 12 },
    { title: '13.0 Logistics & Replenishment At Sea', pageIndex: 13 },
    { title: '14.0 Cyber Defense & PQC Audit Ledger', pageIndex: 14 },
    { title: 'Annex A: Tactical Signal Brevity Codes', pageIndex: 15 },
    { title: 'Annex B: Contingency Base Diversion Protocols', pageIndex: 16 },
    { title: 'Annex C: Authorized Distribution & Audit', pageIndex: 17 },
  ];

  const itemRefs: PDFRef[] = [];

  for (let i = 0; i < outlines.length; i++) {
    const itemRef = context.nextRef();
    itemRefs.push(itemRef);
  }

  const outlinesDictRef = context.nextRef();

  for (let i = 0; i < outlines.length; i++) {
    const targetPageRef = pageRefs[outlines[i].pageIndex];
    const destArray = context.obj([targetPageRef, PDFName.of('Fit')]);

    const itemDict = context.obj({
      Title: PDFName.of(outlines[i].title),
      Parent: outlinesDictRef,
      Dest: destArray,
      ...(i > 0 ? { Prev: itemRefs[i - 1] } : {}),
      ...(i < outlines.length - 1 ? { Next: itemRefs[i + 1] } : {}),
    });

    context.assign(itemRefs[i], itemDict);
  }

  const outlinesDict = context.obj({
    Type: PDFName.of('Outlines'),
    First: itemRefs[0],
    Last: itemRefs[itemRefs.length - 1],
    Count: outlines.length,
  });

  context.assign(outlinesDictRef, outlinesDict);
  pdfDoc.catalog.set(PDFName.of('Outlines'), outlinesDictRef);

  const pdfBytes = await pdfDoc.save();

  // Save to /public/Operation_Briefing_Alpha.pdf
  const outputPath = path.resolve(process.cwd(), 'public', 'Operation_Briefing_Alpha.pdf');
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Generated 18-page synthetic PDF with bookmarks at: ${outputPath} (${pdfBytes.length} bytes)`);
}

generateOperationBriefingPdf().catch(console.error);
