/* Smart University - Enterprise V5.1 Client Engine */

// --- DATA SOURCE CONFIG ---
const API_BASE = 'http://localhost:8000';
let universityDB = {
    campuses: [],
    students: [],
    faculty: [],
    courses: [],
    assets: [],
    workflows: [],
    placements: [],
    finance: { total_fees: '0', scholarships_disbursed: '0', pending_dues: '0' },
    transport: [],
    hostels: [],
    ticker: [],
    notifications: [],
    alumni: [],
    events: [],
    clubs: [],
    health: [],
    helpdesk: []
};

async function syncWithDatabase() {
    console.log("[SUMS] Syncing with enterprise database...");
    try {
        const [campuses, stats, students, faculty, assets, placements, workflows, transport, alumni] = await Promise.all([
            fetch(`${API_BASE}/campuses`).then(r => r.json()),
            fetch(`${API_BASE}/stats`).then(r => r.json()),
            fetch(`${API_BASE}/students?limit=200`).then(r => r.json()),
            fetch(`${API_BASE}/faculty`).then(r => r.json()),
            fetch(`${API_BASE}/assets`).then(r => r.json()),
            fetch(`${API_BASE}/placements`).then(r => r.json()),
            fetch(`${API_BASE}/workflows`).then(r => r.json()),
            fetch(`${API_BASE}/transport`).then(r => r.json()),
            fetch(`${API_BASE}/alumni`).then(r => r.json())
        ]);

        universityDB = {
            campuses: campuses.map(c => ({ id: c.CampusID, name: c.CampusName, city: c.City, status: c.Status || 'Operational', efficiency: '95%' })),
            students: students.map(s => ({
                id: s.StudentID,
                name: `${s.FirstName} ${s.LastName}`,
                dept: s.DeptName,
                campus: 1, 
                gpa: (7.5 + Math.random() * 2.5).toFixed(2),
                status: 'Active',
                skills: { coding: 80, logic: 85, design: 60, comms: 90 }
            })),
            faculty: faculty.map(f => ({
                id: `FAC${f.FacultyID}`,
                name: `${f.FirstName} ${f.LastName}`,
                dept: f.DeptName,
                campus: 1,
                rank: f.FacultyRank,
                courses: 3,
                students: 45
            })),
            courses: [
                { id: 'AI301', title: 'Neural Networks', credits: 4, enrolled: '145/150' },
                { id: 'DS201', title: 'Big Data Analytics', credits: 4, enrolled: '192/200' },
                { id: 'CSE505', title: 'Cloud Computing', credits: 4, enrolled: '240/250' }
            ],
            assets: assets.map(a => ({
                id: a.SerialNo,
                name: a.AssetName,
                type: a.AssetType,
                cond: a.ConditionLevel,
                campus: a.CampusName,
                value: `₹ ${a.EstimatedValue.toLocaleString()}`
            })),
            workflows: workflows.map(w => ({
                id: w.RequestID,
                type: w.RequestType,
                student: `${w.FirstName} ${w.LastName}`,
                status: w.CurrentStatus,
                prio: w.Priority
            })),
            placements: placements.map(p => ({
                company: p.CompanyName,
                offers: p.Offers || 0,
                highest: `₹ ${(p.Highest || 0).toLocaleString()} LPA`,
                avg: `₹ ${(p.Average || 0).toLocaleString()} LPA`
            })),
            finance: {
                total_fees: `₹ ${(stats.total_revenue / 10000000).toFixed(2)} Cr`,
                scholarships_disbursed: '₹ 12.5 Cr',
                pending_dues: '₹ 4.2 Cr'
            },
            transport: transport.routes.map(r => ({
                route: r.RouteName,
                status: 'Active',
                driver: 'System Managed',
                load: '65%'
            })),
            hostels: [
                { block: 'Alpha (Boys)', capacity: 1200, occupied: 1150, mess: 'North Indian Special' },
                { block: 'Sigma (Girls)', capacity: 1500, occupied: 1480, mess: 'Continental' }
            ],
            ticker: [
                '[SYNC] Multi-Campus Ledger (V6.1) optimized via FastAPI.',
                '[DATABASE] Live connection to SmartUniversityDB active.',
                `[STATS] Tracking ${stats.student_count.toLocaleString()} students across all campuses.`
            ],
            notifications: [
                { type: 'success', text: 'Enterprise Database Synchronized', time: 'Just now' }
            ],
            alumni: alumni.map(a => ({
                name: `${a.FirstName} ${a.LastName}`,
                batch: a.GraduationYear,
                company: a.CompanyName || 'Entrepreneur',
                role: a.Designation || 'Founder',
                location: 'Global'
            })),
            events: [
                { id: 'EVT-01', name: 'TechFest 2026', date: '15 May 2026', campus: 'Vellore Main Campus', status: 'Upcoming', seats: '5000' }
            ],
            clubs: [
                { name: 'CyberSec Society', members: 450, president: 'Aditya V.', rating: '5/5' }
            ],
            health: [],
            helpdesk: []
        };

        console.log("[SUMS] Sync Complete. Enterprise Hub Ready.");
        renderView(currentView);
        initTicker();
        renderNotifications();
    } catch (error) {
        console.error("[SUMS] Sync Failed:", error);
        // Fallback to minimal mock if server is down
        universityDB = {
            campuses: [{id: 1, name: 'Offline Mode', city: 'Local', status: 'Offline', efficiency: '0%'}],
            students: [],
            faculty: [],
            courses: [],
            assets: [],
            workflows: [],
            placements: [],
            finance: { total_fees: '0', scholarships_disbursed: '0', pending_dues: '0' },
            transport: [],
            hostels: [],
            ticker: ['[ERROR] Database Offline. Run server.py.'],
            notifications: [{type: 'urgent', text: 'Server Offline', time: 'Now'}],
            alumni: [],
            events: [],
            clubs: [],
            health: [],
            helpdesk: []
        };
        renderView(currentView);
        initTicker();
        renderNotifications();
    }
}


// --- CORE STATE ---
let currentView = 'overview';
let activeRole = 'admin';
let searchQuery = '';
let selectedCampus = 'all';

// --- UI INIT ---
window.onload = async () => {
    // Initialize UI immediately so the user sees the portal layout
    switchPortal('admin');
    // Show a loading indicator while we fetch real data
    const title = document.getElementById('portal-title');
    if (title) title.innerText = 'Connecting to Enterprise Server...';
    await syncWithDatabase(); // Initial sync
};

function handleCampusFilter() {
    selectedCampus = document.getElementById('campus-filter').value;
    renderView(currentView);
}

function initTicker() {
    const track = document.getElementById('ticker-content');
    if(track) {
        track.innerHTML = universityDB.ticker.map(t => `<span>${t}</span>`).join('');
    }
}

function renderNotifications() {
    const list = document.getElementById('notification-list');
    if(!list) return;
    list.innerHTML = universityDB.notifications.map(n => `
        <div class="notif-item ${n.type === 'urgent' ? 'badge-urgent' : n.type === 'success' ? 'badge-success' : ''}">
            <p style="font-size: 0.85rem; font-weight: 600;">${n.text}</p>
            <span class="notif-time">${n.time}</span>
        </div>
    `).join('');
}

function toggleNotificationTray() {
    document.getElementById('notification-tray').classList.toggle('open');
}

function toggleConsole() {
    const el = document.getElementById('command-console');
    el.style.display = (el.style.display === 'flex') ? 'none' : 'flex';
    if(el.style.display === 'flex') document.getElementById('console-input').focus();
}

function handleConsole(e) {
    if(e.key === 'Enter') {
        const input = e.target.value.toLowerCase();
        const log = document.getElementById('console-output');
        let response = `> Command '${input}' not recognized. Try 'query -assets', 'sys -stats' or 'clear'.`;
        
        if(input === 'query -assets') response = `> Found ${universityDB.assets.length} high-value assets across 5 campuses. integrity: 100%`;
        if(input === 'sys -stats') response = `> CPU: 48% | DB_LATENCY: 0.6ms | SESSIONS: 8,401 | SECURITY: ACTIVE`;
        if(input === 'clear') { log.innerHTML = ''; e.target.value = ''; return; }

        log.innerHTML += `<p style="color: var(--acc-primary)"># ${e.target.value}</p><p>${response}</p>`;
        log.scrollTop = log.scrollHeight;
        e.target.value = '';
    }
}

function handleSearch() {
    searchQuery = document.getElementById('global-search').value;
    if (searchQuery.length > 0) {
        if (currentView !== 'student-search') {
            // Need to set active state and render view
            currentView = 'student-search';
        }
        renderView('student-search');
    }
}

// --- PORTAL NAVIGATION ---

function switchPortal(role) {
    activeRole = role;
    const tag = document.getElementById('active-role-tag');
    const nav = document.getElementById('master-nav');
    document.body.className = `role-${role}`;

    const configs = {
        admin: {
            tag: 'ULTRA-ENT COMMAND CENTER',
            nav: [
                { id: 'overview', icon: 'chess-board', label: 'Global Ops' },
                { id: 'campus-hub', icon: 'map-location-dot', label: 'Campus Hub' },
                { id: 'placement-hub', icon: 'ranking-star', label: 'Placement Hub' },
                { id: 'financial-vault', icon: 'vault', label: 'Financial Vault' },
                { id: 'transport-hub', icon: 'bus', label: 'Global Logistics' },
                { id: 'hostel-hub', icon: 'hotel', label: 'Hostel Life' },
                { id: 'library-vault', icon: 'book', label: 'Digital Library' },
                { id: 'asset-vault', icon: 'boxes-stacked', label: 'Asset Vault' },
                { id: 'workflow-desk', icon: 'file-signature', label: 'Workflows' },
                { id: 'student-search', icon: 'search', label: 'Global Search' },
                { id: 'alumni-connect', icon: 'user-graduate', label: 'Alumni Network' },
                { id: 'events-management', icon: 'calendar-alt', label: 'Events Manager' },
                { id: 'clubs-societies', icon: 'users-rectangle', label: 'Clubs & Societies' },
                { id: 'health-wellness', icon: 'heart-pulse', label: 'Health & Wellness' },
                { id: 'it-helpdesk', icon: 'headset', label: 'IT Helpdesk' },
                { id: 'exam-seating', icon: 'chair', label: 'Exam Seating' }
            ]
        },
        student: {
            tag: 'GLOBAL STUDENT HUB',
            nav: [
                { id: 'student-dashboard', icon: 'id-card', label: 'My Profile' },
                { id: 'course-management', icon: 'book-open', label: 'Course Catalog' },
                { id: 'library-vault', icon: 'book', label: 'My Library' },
                { id: 'transport-hub', icon: 'bus', label: 'Campus Shuttle' },
                { id: 'hostel-hub', icon: 'hotel', label: 'My Hostel' },
                { id: 'placement-hub', icon: 'ranking-star', label: 'Placements' },
                { id: 'doc-requests', icon: 'file-export', label: 'My Requests' },
                { id: 'clubs-societies', icon: 'users-rectangle', label: 'Clubs & Societies' },
                { id: 'events-management', icon: 'calendar-alt', label: 'Events & Fests' },
                { id: 'health-wellness', icon: 'heart-pulse', label: 'Health Clinic' },
                { id: 'alumni-connect', icon: 'user-graduate', label: 'Alumni Mentorship' },
                { id: 'it-helpdesk', icon: 'headset', label: 'IT Support' }
            ]
        },
        faculty: {
            tag: 'ACADEMIC FACULTY SUITE',
            nav: [
                { id: 'faculty-dashboard', icon: 'user-tie', label: 'My Profile' },
                { id: 'course-management', icon: 'book-open', label: 'My Courses' },
                { id: 'student-roster', icon: 'users', label: 'Student Roster' },
                { id: 'placement-hub', icon: 'ranking-star', label: 'Placement Cell' },
                { id: 'exam-seating', icon: 'chair', label: 'Invigilation' },
                { id: 'events-management', icon: 'calendar-alt', label: 'Academic Events' },
                { id: 'it-helpdesk', icon: 'headset', label: 'IT Support' }
            ]
        }
    };

    const config = configs[role];
    tag.innerText = config.tag;
    nav.innerHTML = config.nav.map(item => `
        <li class="nav-item ${currentView === item.id ? 'active' : ''}" onclick="renderView('${item.id}')">
            <i class="fas fa-${item.icon}"></i> <span>${item.label}</span>
        </li>
    `).join('');
    
    renderView(config.nav[0].id);
}

// --- RENDER ENGINE ---

function renderView(view) {
    currentView = view;
    const container = document.getElementById('view-container');
    const title = document.getElementById('portal-title');
    const desc = document.getElementById('portal-desc');

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('onclick').includes(`'${view}'`));
    });

    let html = `<div class="animate-fade">`;

    const getFilteredStudents = () => selectedCampus === 'all' ? universityDB.students : universityDB.students.filter(s => s.campus == selectedCampus);
    const getFilteredFaculty = () => selectedCampus === 'all' ? universityDB.faculty : universityDB.faculty.filter(f => f.campus == selectedCampus);
    const getFilteredAssets = () => selectedCampus === 'all' ? universityDB.assets : universityDB.assets.filter(a => a.campus.includes(universityDB.campuses.find(c => c.id == selectedCampus)?.name || ''));

    switch(view) {
        case 'overview':
            title.innerText = selectedCampus === 'all' ? 'Global University Operations' : `${universityDB.campuses.find(c => c.id == selectedCampus).name} Hub`;
            desc.innerText = 'Synchronized command center for multi-campus infrastructure.';
            html += `
                <div class="portal-grid">
                    ${renderStatCard('Campus Registrations', getFilteredStudents().length.toLocaleString(), 'globe', '#3b82f6')}
                    ${renderStatCard('Campus Asset Value', selectedCampus === 'all' ? '₹ 154.5 Cr' : '₹ 38.6 Cr', 'vault', '#10b981')}
                    ${renderStatCard('Active Faculty', getFilteredFaculty().length.toLocaleString(), 'user-tie', '#f59e0b')}
                    ${renderStatCard('Efficiency Yield', universityDB.campuses.find(c => c.id == selectedCampus)?.efficiency || '94.2%', 'microchip', '#ef4444')}
                </div>
                <div class="portal-grid" style="margin-top: 2rem;">
                    <div class="p-card" style="grid-column: span 3;">
                        <h3 style="font-weight: 800; letter-spacing: 0.5px; margin-bottom: 1rem;">Strategic Performance Matrix</h3>
                        <canvas id="chart-ultra-radar" style="max-height: 400px; width: 100%;"></canvas>
                    </div>
                    <div class="p-card" style="display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <h3 style="font-weight: 800; margin-bottom: 1rem;">Command Console</h3>
                            <button class="btn" style="width: 100%; margin-bottom: 1rem;" onclick="toggleConsole()"><i class="fas fa-terminal"></i> Enter Terminal</button>
                            <p style="font-size: 0.75rem; color: var(--text-muted); line-height: 1.5;">Direct access to SmartUniversityDB v6.0 cluster.</p>
                        </div>
                        <div style="padding-top: 1rem; border-top: 1px solid var(--border)">
                            <h4 style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Network Status</h4>
                            <div style="font-size: 1.5rem; color: var(--acc-secondary); font-weight: 800;">ENCRYPTED</div>
                        </div>
                    </div>
                </div>
            `;
            setTimeout(initUltraCharts, 100);
            break;

        case 'campus-hub':
            title.innerText = 'Global Infrastructure Map';
            desc.innerText = 'Managing decentralized educational hubs.';
            const displayCampuses = selectedCampus === 'all' ? universityDB.campuses : universityDB.campuses.filter(c => c.id == selectedCampus);
            html += `
                <div class="portal-grid" style="background: linear-gradient(135deg, rgba(13, 17, 23, 0.9), rgba(59, 130, 246, 0.2)), radial-gradient(circle at top right, rgba(16, 185, 129, 0.1), transparent); padding: 2rem; border-radius: 28px; margin-bottom: 2rem; position: relative;">
                    <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.2); border-radius: 28px;"></div>
                    <div style="position: relative; z-index: 2; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
                        ${displayCampuses.map(c => `
                            <div class="p-card" style="border-top: 4px solid var(--acc-primary); background: rgba(13, 17, 23, 0.8);">
                                <h4 style="color: var(--acc-primary); font-size: 1.25rem; font-weight: 800;">${c.name}</h4>
                                <p style="margin-bottom: 1rem; color: var(--text-muted);">${c.city} | <span style="color: var(--acc-secondary)">${c.status}</span></p>
                                <div style="background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 0.5rem; font-size: 0.85rem;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                        <span>Efficiency Yield</span>
                                        <span style="color: var(--text-main); font-weight: bold;">${c.efficiency}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between;">
                                        <span>Active Students</span>
                                        <span style="color: var(--text-main); font-weight: bold;">${universityDB.students.filter(s => s.campus == c.id).length.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;

        case 'asset-vault':
            title.innerText = 'Enterprise Asset Ledger';
            desc.innerText = 'Real-time tracking of hardware and infrastructure assets.';
            html += `
                <div class="table-container">
                    <table>
                        <thead><tr><th>Asset ID</th><th>Asset Name</th><th>Type</th><th>Condition</th><th>Campus</th><th>Est. Value</th></tr></thead>
                        <tbody>
                            ${getFilteredAssets().slice(0, 50).map(a => `
                                <tr>
                                    <td><code style="color: var(--acc-primary);">${a.id}</code></td>
                                    <td><strong>${a.name}</strong></td>
                                    <td>${a.type}</td>
                                    <td style="color: ${a.cond === 'New' ? 'var(--acc-secondary)' : '#f59e0b'}">${a.cond}</td>
                                    <td>${a.campus}</td>
                                    <td style="font-weight: 800;">${a.value}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'workflow-desk':
            title.innerText = 'Cross-Campus Workflow Engine';
            desc.innerText = 'Automated processing of enterprise-scale document requests.';
            html += `
                <div class="table-container">
                    <table>
                        <thead><tr><th>Request ID</th><th>Document Type</th><th>Student Context</th><th>Current Phase</th><th>Priority</th><th>Action</th></tr></thead>
                        <tbody>
                            ${universityDB.workflows.map(w => `
                                <tr>
                                    <td>#REQ-${w.id}</td>
                                    <td><strong>${w.type}</strong></td>
                                    <td>${w.student}</td>
                                    <td><span style="color: var(--acc-primary); font-weight: 600;">${w.status}</span></td>
                                    <td><span class="badge ${w.prio === 'Urgent' ? 'badge-urgent' : ''}" style="color: ${w.prio === 'Urgent' ? 'var(--acc-danger)' : 'var(--text-muted)'}">${w.prio}</span></td>
                                    <td><button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.7rem;" onclick="alert('Advancing Workflow Stage...')">PROCESS</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'student-search':
            title.innerText = 'Global Identity Ledger';
            desc.innerText = 'Secure lookup across 50,000+ student profiles.';
            const filtered = getFilteredStudents().filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                item.id.toLowerCase().includes(searchQuery.toLowerCase())
            ).slice(0, 20);
            
            html += `
                <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-size: 0.85rem; color: var(--text-muted)">Results for: <strong style="color:white">${searchQuery || '*'}</strong> in <strong style="color:var(--acc-primary)">${selectedCampus === 'all' ? 'Global' : universityDB.campuses.find(c => c.id == selectedCampus).city}</strong></div>
                    <div style="font-size: 0.75rem; color: var(--acc-secondary)">V6.0 ENCRYPTION ACTIVE</div>
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Reg ID</th><th>Full Name</th><th>Branch</th><th>Campus</th><th>CGPA</th><th>Status</th></tr></thead>
                        <tbody>
                            ${filtered.map(s => `
                                <tr onclick="openAudit('${s.id}')" style="cursor: pointer;">
                                    <td><strong style="color: var(--acc-primary)">${s.id}</strong></td>
                                    <td>${s.name}</td>
                                    <td>${s.dept}</td>
                                    <td>${universityDB.campuses.find(c => c.id == s.campus).city}</td>
                                    <td style="color: #f59e0b; font-weight: 800;">${s.gpa}</td>
                                    <td><span style="border-radius: 4px; padding: 2px 8px; font-size: 0.7rem; background: ${s.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${s.status === 'Active' ? 'var(--acc-secondary)' : 'var(--acc-danger)'}; font-weight: 900;">${s.status.toUpperCase()}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'placement-hub':
            title.innerText = 'Corporate Placement Analytics';
            desc.innerText = 'Tracking recruitment cycles and multi-campus offer letter distribution.';
            html += `
                <div class="portal-grid">
                    ${renderStatCard('Average CTC', '₹ 14.5 LPA', 'chart-line', '#3b82f6')}
                    ${renderStatCard('Highest CTC', '₹ 72 LPA', 'fire', '#ef4444')}
                    ${renderStatCard('Offer Letters Issued', '1,240', 'file-contract', '#10b981')}
                    ${renderStatCard('Total Recruiters', '85+', 'building', '#f59e0b')}
                </div>
                <div class="table-container" style="margin-top: 2rem;">
                    <table>
                        <thead><tr><th>Company</th><th>Total Offers</th><th>Highest Package</th><th>Average Package</th><th>Action</th></tr></thead>
                        <tbody>
                            ${universityDB.placements.map(p => `
                                <tr>
                                    <td><strong>${p.company}</strong></td>
                                    <td>${p.offers}</td>
                                    <td style="color: var(--acc-secondary); font-weight: 800;">${p.highest}</td>
                                    <td>${p.avg}</td>
                                    <td><button class="btn btn-sm" onclick="alert('Viewing detailed recruitment list for ${p.company}')">DETAILS</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'transport-hub':
            title.innerText = 'Global Transport Logistics';
            desc.innerText = 'Real-time tracking of inter-campus shuttles and local routes.';
            html += `
                <div class="portal-grid">
                    ${renderStatCard('Active Shuttles', '45', 'bus', '#3b82f6')}
                    ${renderStatCard('Routes Managed', '12', 'route', '#10b981')}
                    <span></span><span></span>
                </div>
                <div class="table-container" style="margin-top: 2rem;">
                    <table>
                        <thead><tr><th>Route Name</th><th>Current Status</th><th>Driver</th><th>Current Load</th><th>Action</th></tr></thead>
                        <tbody>
                            ${universityDB.transport.map(t => `
                                <tr>
                                    <td><strong>${t.route}</strong></td>
                                    <td><span style="color: ${t.status === 'In Transit' ? 'var(--acc-secondary)' : 'var(--text-muted)'}">${t.status}</span></td>
                                    <td>${t.driver}</td>
                                    <td><div style="width: 100px; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden;">
                                        <div style="width: ${t.load}; height: 100%; background: var(--acc-primary);"></div>
                                    </div> <span style="font-size: 0.7rem;">${t.load}</span></td>
                                    <td><button class="btn btn-sm" onclick="alert('GPS tracking activated...')">TRACK</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'hostel-hub':
            title.innerText = 'Residential Life & Hostels';
            desc.innerText = 'Managing student accommodation and campus dining services.';
            html += `
                <div class="portal-grid">
                    ${universityDB.hostels.map(h => `
                        <div class="p-card">
                            <h4 style="color: var(--acc-primary); margin-bottom: 0.5rem;">${h.block}</h4>
                            <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem;">MESS: ${h.mess}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="font-size: 1.5rem; font-weight: 800;">${h.occupied}/${h.capacity}</div>
                                <div style="font-size: 0.65rem; padding: 2px 8px; border-radius: 10px; background: rgba(58, 237, 170, 0.1); color: var(--acc-secondary);">
                                    ${Math.round((h.occupied/h.capacity)*100)}% FULL
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="p-card" style="margin-top: 2rem;">
                    <h4>Hostel Maintenance Requests</h4>
                    <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">No pending urgent requests for your sector.</p>
                </div>
            `;
        case 'financial-vault':
            title.innerText = 'Institutional Financial Vault';
            desc.innerText = 'Budgetary control and fee reconciliation for multi-campus enterprise.';
            html += `
                <div style="background: linear-gradient(120deg, rgba(16, 185, 129, 0.15) 0%, rgba(13, 17, 23, 0.9) 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 8px); border-radius: 28px; padding: 3rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(to right, rgba(1,4,9,0.9), rgba(1,4,9,0.2));"></div>
                    <div style="position: relative; z-index: 2;">
                        <div class="portal-grid">
                            ${renderStatCard('Gross Fee Revenue', universityDB.finance.total_fees, 'wallet', '#3b82f6')}
                            ${renderStatCard('Scholarship Budget', universityDB.finance.scholarships_disbursed, 'graduation-cap', '#8b5cf6')}
                            ${renderStatCard('Outstanding Dues', universityDB.finance.pending_dues, 'clock', '#ef4444')}
                            ${renderStatCard('Campus Operating Budget', '₹ 120 Cr', 'building-columns', '#10b981')}
                        </div>
                    </div>
                </div>
                <div class="portal-grid">
                    <div class="p-card" style="grid-column: span 2;">
                        <h4>Revenue Distribution</h4>
                        <div style="height: 200px; display:flex; align-items:center; justify-content: center; background: rgba(255,255,255,0.02); border-radius: 1rem;">
                            <p style="color: var(--acc-secondary); font-size: 0.9rem; font-weight: 800;">[ LIVE FISCAL SYNC ACTIVE ]</p>
                        </div>
                    </div>
                    <div class="p-card">
                        <h4>Recent Transactions</h4>
                        <div style="font-size: 0.75rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.8rem; margin-top: 1rem;">
                            <div style="display:flex; justify-content: space-between;"><span>#TX-901 (Scholarship)</span><span style="color: var(--acc-secondary)">- ₹ 45k</span></div>
                            <div style="display:flex; justify-content: space-between;"><span>#TX-902 (Fee Payment)</span><span style="color: var(--acc-primary)">+ ₹ 1.2L</span></div>
                            <div style="display:flex; justify-content: space-between;"><span>#TX-903 (Asset Purchase)</span><span style="color: var(--acc-danger)">- ₹ 8.5L</span></div>
                        </div>
                    </div>
                </div>
            `;
            break;

        case 'library-vault':
            title.innerText = 'Digital Library & Research Vault';
            desc.innerText = 'Search through 2M+ digital volumes and research archives.';
            html += `
                <div style="background: radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.15) 0%, rgba(13, 17, 23, 0.95) 100%), linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%); border-radius: 28px; padding: 3rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
                    <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.4);"></div>
                    <div style="position: relative; z-index: 2; text-align: center;">
                        <input type="text" class="btn" style="width: 80%; background: rgba(255,255,255,0.1); border: 1px solid var(--border); color: white; padding: 1.5rem; border-radius: 50px;" placeholder="Search for Books, Papers, or Journals...">
                    </div>
                </div>
                <div class="portal-grid">
                    <div class="p-card">
                        <h4 style="color: var(--acc-primary)">Borrowed Assets</h4>
                        <div style="margin-top: 1rem; font-size: 0.85rem;">
                            <p><strong>Design Patterns</strong> - <span style="color: var(--acc-danger)">OVERDUE (2 Days)</span></p>
                            <p style="margin-top: 0.5rem;"><strong>Clean Code</strong> - Due in 5 Days</p>
                        </div>
                    </div>
                    <div class="p-card">
                        <h4 style="color: var(--acc-secondary)">Digital Access</h4>
                        <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">IEEE Xplore, ACM Digital Library, and Springer-Nature access is active for your profile.</p>
                    </div>
                </div>
            `;
            break;
            
        case 'student-dashboard':
            const me = universityDB.students[0]; // Example: Logged in as first student
            title.innerText = `Identity: ${me.name}`;
            desc.innerText = `${me.dept} | Semester 4 | UID: ${me.id}`;
            html += `
                <div class="portal-grid">
                    <div class="p-card" style="grid-column: span 2;">
                        <h4>Skill Vector Matrix</h4>
                        <div style="display:flex; justify-content:center; align-items:center; margin-top:1rem;">
                            <canvas id="chart-student-radar" style="max-height: 250px;"></canvas>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div class="p-card">
                            <h4 style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Academic CGPA</h4>
                            <p class="stat-value" style="color: #f59e0b; font-size: 3rem;">${me.gpa}</p>
                        </div>
                        <div class="p-card">
                            <h4 style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Portal Status</h4>
                            <p class="stat-value" style="color: var(--acc-primary); font-size: 2rem;">${me.status}</p>
                        </div>
                    </div>
                </div>
            `;
            setTimeout(initStudentChart, 100);
            break;
            
        case 'doc-requests':
            title.innerText = 'My Document Requests';
            desc.innerText = 'Track the status of your official university documents.';
            const myWorkflows = universityDB.workflows.filter(w => w.student.includes(universityDB.students[0].id));
            html += `
                <button class="btn" style="margin-bottom: 1.5rem;" onclick="alert('Submission portal initialized.')"><i class="fas fa-plus"></i> New Request</button>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Request ID</th><th>Document Type</th><th>Status</th><th>Priority</th></tr></thead>
                        <tbody>
                            ${myWorkflows.length > 0 ? myWorkflows.map(w => `
                                <tr>
                                    <td>#REQ-${w.id}</td>
                                    <td><strong>${w.type}</strong></td>
                                    <td><span style="color: var(--acc-primary)">${w.status}</span></td>
                                    <td><span style="color: ${w.prio === 'Urgent' ? 'var(--acc-danger)' : 'var(--text-muted)'}">${w.prio}</span></td>
                                </tr>
                            `).join('') : `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No active document requests.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'faculty-dashboard':
            const prof = universityDB.faculty[0]; // Example: Logged in as first faculty
            title.innerText = `Faculty Profile: ${prof.name}`;
            desc.innerText = `${prof.rank} | ${prof.dept} | Campus ${prof.campus}`;
            html += `
                <div class="portal-grid">
                    <div class="p-card">
                        <h4>Course Load</h4>
                        <p class="stat-value" style="color: #3b82f6; font-size: 3rem;">${prof.courses}</p>
                        <p style="color: var(--text-muted); font-size: 0.8rem;">Active Courses</p>
                    </div>
                    <div class="p-card">
                        <h4>Student Count</h4>
                        <p class="stat-value" style="color: #10b981; font-size: 3rem;">${prof.students}</p>
                        <p style="color: var(--text-muted); font-size: 0.8rem;">Enrolled Students</p>
                    </div>
                    <div class="p-card">
                        <h4>Department</h4>
                        <p class="stat-value" style="color: #f59e0b; font-size: 1.5rem;">${prof.dept}</p>
                    </div>
                    <div class="p-card">
                        <h4>Campus</h4>
                        <p class="stat-value" style="color: #ef4444; font-size: 1.5rem;">Campus ${prof.campus}</p>
                    </div>
                </div>
            `;
            break;

        case 'course-management':
            title.innerText = 'Elite Course Catalog';
            desc.innerText = 'Manage and monitor cross-campus academic offerings.';
            html += `
                <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <button class="btn" onclick="alert('Course creation wizard launched.')"><i class="fas fa-plus"></i> Add New Course</button>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">ACTIVE COURSES: ${universityDB.courses.length}</span>
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Course ID</th><th>Course Title</th><th>Credits</th><th>Enrolled</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${universityDB.courses.map(c => `
                                <tr>
                                    <td><code style="color: var(--acc-accent)">${c.id}</code></td>
                                    <td><strong>${c.title}</strong></td>
                                    <td>${c.credits}</td>
                                    <td>${c.enrolled}</td>
                                    <td><span style="color: var(--acc-secondary)">ACTIVE</span></td>
                                    <td><button class="btn btn-sm" style="padding: 0.3rem 0.5rem; font-size: 0.65rem;" onclick="alert('Gradebook opened for ${c.id}')">GRADES</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'student-roster':
            title.innerText = 'Student Roster';
            desc.innerText = 'View and manage students in your courses.';
            const myStudents = universityDB.students.slice(0, 20); // Example: First 20 students
            html += `
                <div class="table-container">
                    <table>
                        <thead><tr><th>Student ID</th><th>Name</th><th>Department</th><th>GPA</th><th>Status</th></tr></thead>
                        <tbody>
                            ${myStudents.map(s => `
                                <tr>
                                    <td>${s.id}</td>
                                    <td>${s.name}</td>
                                    <td>${s.dept}</td>
                                    <td>${s.gpa}</td>
                                    <td>${s.status}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'alumni-connect':
            title.innerText = 'Global Alumni Network';
            desc.innerText = 'Connect with top-tier university alumni across the globe.';
            html += `
                <div class="portal-grid">
                    ${universityDB.alumni.map(a => `
                        <div class="p-card">
                            <h4 style="color: var(--acc-primary); font-size: 1.25rem;">${a.name}</h4>
                            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Batch of ${a.batch}</p>
                            <p style="font-size: 0.95rem; margin-bottom: 0.5rem;"><i class="fas fa-building" style="color: var(--acc-secondary); width: 20px;"></i> ${a.company}</p>
                            <p style="font-size: 0.95rem; margin-bottom: 0.5rem;"><i class="fas fa-briefcase" style="color: #f59e0b; width: 20px;"></i> ${a.role}</p>
                            <p style="font-size: 0.95rem;"><i class="fas fa-map-marker-alt" style="color: #ef4444; width: 20px;"></i> ${a.location}</p>
                            <button class="btn" style="width: 100%; margin-top: 1rem; padding: 0.5rem;"><i class="fas fa-paper-plane"></i> Connect</button>
                        </div>
                    `).join('')}
                </div>
            `;
            break;

        case 'events-management':
            title.innerText = 'Campus Events & Festivities';
            desc.innerText = 'Discover, register, and manage upcoming events across all campuses.';
            html += `
                <button class="btn" style="margin-bottom: 1.5rem;" onclick="alert('Event creation dialog opened.')"><i class="fas fa-plus"></i> Create New Event</button>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Event ID</th><th>Name</th><th>Date</th><th>Location</th><th>Capacity</th><th>Status</th></tr></thead>
                        <tbody>
                            ${universityDB.events.map(e => `
                                <tr>
                                    <td><code style="color: var(--acc-primary);">${e.id}</code></td>
                                    <td><strong>${e.name}</strong></td>
                                    <td>${e.date}</td>
                                    <td>${e.campus}</td>
                                    <td>${e.seats}</td>
                                    <td><span style="color: ${e.status === 'Upcoming' ? 'var(--acc-secondary)' : e.status === 'Planning' ? '#f59e0b' : '#3b82f6'}; font-weight: bold;">${e.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'clubs-societies':
            title.innerText = 'Clubs & Student Societies';
            desc.innerText = 'Engage in extracurriculars and vibrant student communities.';
            html += `
                <div class="portal-grid">
                    ${universityDB.clubs.map(c => `
                        <div class="p-card" style="border-top: 4px solid var(--acc-primary);">
                            <h4 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${c.name}</h4>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span>Members:</span>
                                <span style="font-weight: bold; color: var(--acc-secondary);">${c.members}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem;">
                                <span>President:</span>
                                <span>${c.president}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.9rem;">
                                <span>Rating:</span>
                                <span style="color: #f59e0b;"><i class="fas fa-star"></i> ${c.rating}</span>
                            </div>
                            <button class="btn" style="width: 100%;"><i class="fas fa-user-plus"></i> Join Club</button>
                        </div>
                    `).join('')}
                </div>
            `;
            break;

        case 'health-wellness':
            title.innerText = 'Health & Wellness Center';
            desc.innerText = 'Book appointments and view active medical staff on campus.';
            html += `
                <div class="portal-grid">
                    ${universityDB.health.map(h => `
                        <div class="p-card">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--bg-sidebar); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: var(--acc-danger);">
                                    <i class="fas fa-user-md"></i>
                                </div>
                                <div>
                                    <h4 style="font-size: 1.1rem;">${h.doctor}</h4>
                                    <p style="font-size: 0.8rem; color: var(--text-muted);">${h.specialization}</p>
                                </div>
                            </div>
                            <p style="font-size: 0.9rem; margin-bottom: 0.5rem;"><i class="fas fa-clock" style="width: 20px;"></i> ${h.available}</p>
                            <p style="font-size: 0.9rem; margin-bottom: 1rem;">Status: <strong style="color: ${h.status === 'Available' ? 'var(--acc-secondary)' : '#f59e0b'};">${h.status}</strong></p>
                            <button class="btn" style="width: 100%; background: ${h.status === 'Available' ? 'var(--acc-secondary)' : 'var(--bg-sidebar)'}; border-color: ${h.status === 'Available' ? 'var(--acc-secondary)' : 'var(--border)'};" ${h.status === 'Available' ? '' : 'disabled'}>Book Slot</button>
                        </div>
                    `).join('')}
                </div>
            `;
            break;

        case 'it-helpdesk':
            title.innerText = 'IT Helpdesk & Support';
            desc.innerText = 'Raise technical issues and track their resolution status.';
            html += `
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <button class="btn" onclick="alert('New IT Ticket generated.')"><i class="fas fa-ticket-alt"></i> Raise New Ticket</button>
                    <div style="display: flex; gap: 1rem;">
                        <span style="font-size: 0.85rem; padding: 0.5rem; background: rgba(59,130,246,0.1); border-radius: 0.5rem; color: #3b82f6;">Total: ${universityDB.helpdesk.length}</span>
                        <span style="font-size: 0.85rem; padding: 0.5rem; background: rgba(16,185,129,0.1); border-radius: 0.5rem; color: #10b981;">Resolved: ${universityDB.helpdesk.filter(t => t.status==='Resolved').length}</span>
                    </div>
                </div>
                <div class="table-container">
                    <table>
                        <thead><tr><th>Ticket ID</th><th>Reported By</th><th>Issue Description</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${universityDB.helpdesk.map(t => `
                                <tr>
                                    <td><code style="color: var(--acc-primary);">${t.ticket}</code></td>
                                    <td>${t.user}</td>
                                    <td>${t.issue}</td>
                                    <td><span style="padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; background: ${t.status === 'Resolved' ? 'rgba(16,185,129,0.1)' : t.status === 'In Progress' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${t.status === 'Resolved' ? '#10b981' : t.status === 'In Progress' ? '#f59e0b' : '#ef4444'}; font-weight: bold;">${t.status.toUpperCase()}</span></td>
                                    <td><button class="btn btn-sm" onclick="alert('Viewing Ticket ${t.ticket}')">VIEW</button></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            break;

        case 'exam-seating':
            title.innerText = 'Examination Seating & Layouts';
            desc.innerText = 'Automated hall allocation and invigilation schedules.';
            html += `
                <div class="portal-grid">
                    <div class="p-card" style="grid-column: span 3; text-align: center; padding: 3rem;">
                        <i class="fas fa-chair" style="font-size: 4rem; color: var(--acc-primary); margin-bottom: 1rem;"></i>
                        <h3 style="margin-bottom: 1rem;">Mid-Term Examination Schedule (Fall 2026)</h3>
                        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto 2rem auto;">Seating arrangement matrix is currently being generated by the AI scheduler. Allocations will prioritize inter-departmental shuffling for maximum academic integrity.</p>
                        <div style="display: flex; justify-content: center; gap: 1rem;">
                            <button class="btn"><i class="fas fa-download"></i> Download Master Draft</button>
                            <button class="btn" style="background: transparent; border-color: var(--border);"><i class="fas fa-sync"></i> Force Regeneration</button>
                        </div>
                    </div>
                </div>
            `;
            break;

        default:
            title.innerText = 'Unknown Module';
            desc.innerText = '';
            html += `<div class="p-card"><h3>${view.toUpperCase()} MODULE</h3><p>Relational hooks initialized. Awaiting Ultra-Enterprise data sync.</p></div>`;
    }

    html += `</div>`;
    container.innerHTML = html;

    // Apply staggered animation to cards
    const cards = container.querySelectorAll('.p-card');
    cards.forEach((card, i) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.1}s`;
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 50);
    });
}

// --- HELPER COMPONENTS ---

function renderStatCard(label, value, icon, color) {
    return `
        <div class="p-card">
            <div style="display: flex; justify-content: space-between;">
                <h4 style="color: var(--text-muted); font-size: 0.75rem; text-transform: uppercase;">${label}</h4>
                <i class="fas fa-${icon}" style="color: ${color};"></i>
            </div>
            <p class="stat-value" style="font-size: 2rem; font-weight: 800; margin-top: 0.5rem;">${value}</p>
        </div>
    `;
}

function initUltraCharts() {
    const ctx = document.getElementById('chart-ultra-radar');
    if(!ctx) return;
    new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Research', 'Placement', 'Budget', 'Student Satisfaction', 'Infrastructure'],
            datasets: [{
                label: 'Vellore Main',
                data: [95, 88, 90, 85, 92],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderWidth: 2
            }, {
                label: 'Chennai Tech',
                data: [82, 98, 70, 92, 85],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderWidth: 2
            }, {
                label: 'Bhopal Eng',
                data: [78, 85, 88, 90, 80],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                borderWidth: 2
            }, {
                label: 'Delhi Business',
                data: [85, 92, 95, 88, 90],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                borderWidth: 2
            }, {
                label: 'Amaravati Central',
                data: [80, 85, 82, 88, 85],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderWidth: 2
            }]
        },
        options: { 
            plugins: { legend: { labels: { color: '#f8fafc', font: { family: 'Outfit', size: 13 } } } }, 
            scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }, ticks: { display: false } } } 
        }
    });
}

function initStudentChart() {
    const ctx = document.getElementById('chart-student-radar');
    if(!ctx) return;
    const me = universityDB.students[0];
    new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: ['Coding', 'Algorithms', 'System Design', 'Communication'],
            datasets: [{
                label: 'Aptitude Matrix',
                data: [me.skills.coding, me.skills.logic, me.skills.design, me.skills.comms],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                borderWidth: 2
            }]
        },
        options: { 
            plugins: { legend: { display: false } }, 
            scales: { r: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }, ticks: { display: false } } } 
        }
    });
}
// --- UI UTILITIES ---

let currentSlide = 0;
const slides = [
    { title: 'Global Infrastructure', content: 'Managing 5 campuses with 50,000+ students and 10,500 faculty members across India.' },
    { title: 'Fiscal Governance', content: 'Unified ledger tracking ₹ 450 Cr in revenue with real-time scholarship disbursement.' },
    { title: 'Corporate Pipeline', content: '85+ global recruiters including Google, NVIDIA, and Microsoft with highest CTC of ₹ 72 LPA.' },
    { title: 'Digital Assets', content: '5,000+ high-value IT and lab assets synchronized across the regional network.' }
];

function togglePresentation(show) {
    const layer = document.getElementById('presentation-layer');
    if(!layer) return;
    layer.style.display = show ? 'flex' : 'none';
    if(show) {
        currentSlide = 0;
        renderSlide();
    }
}

function renderSlide() {
    const container = document.getElementById('presentation-slides');
    const slide = slides[currentSlide];
    container.innerHTML = `
        <div style="text-align: center; max-width: 800px;">
            <h2 style="font-size: 4rem; font-weight: 900; margin-bottom: 2rem; background: linear-gradient(135deg, #fff, var(--acc-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${slide.title}</h2>
            <p style="font-size: 1.5rem; color: var(--text-muted); line-height: 1.6;">${slide.content}</p>
        </div>
    `;
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    renderSlide();
}

function closeAudit() {
    document.getElementById('audit-modal').style.display = 'none';
}

function openAudit(studentId) {
    const modal = document.getElementById('audit-modal');
    const content = document.getElementById('audit-content');
    const student = universityDB.students.find(s => s.id === studentId);
    
    if(student) {
        content.innerHTML = `
            <h2 style="color: var(--acc-primary); font-weight: 800; margin-bottom: 1rem;">${student.name} [${student.id}]</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                <div>DEPT: <strong style="color:white">${student.dept}</strong></div>
                <div>CAMPUS: <strong style="color:white">${universityDB.campuses.find(c => c.id == student.campus).city}</strong></div>
                <div>CGPA: <strong style="color:#f59e0b">${student.gpa}</strong></div>
                <div>STATUS: <strong style="color:var(--acc-secondary)">${student.status}</strong></div>
            </div>
            <div style="margin-top: 2rem;">
                <h4 style="font-size: 0.75rem; text-transform: uppercase; margin-bottom: 1rem;">Skill Assessment</h4>
                <canvas id="modal-radar" style="max-height: 200px;"></canvas>
            </div>
        `;
        modal.style.display = 'flex';
        setTimeout(() => {
            const ctx = document.getElementById('modal-radar');
            new Chart(ctx.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Coding', 'Logic', 'Design', 'Comms'],
                    datasets: [{
                        label: 'Metrics',
                        data: [student.skills.coding, student.skills.logic, student.skills.design, student.skills.comms],
                        borderColor: '#38bdf8',
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        borderWidth: 2
                    }]
                },
                options: { 
                    plugins: { legend: { display: false } },
                    scales: { r: { grid: { color: 'rgba(255,255,255,0.1)' }, pointLabels: { color: '#94a3b8' }, ticks: { display: false }, beginAtZero: true, max: 100 } }
                }
            });
        }, 100);
    }
}
