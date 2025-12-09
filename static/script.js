let allMeetings = [];
let allClients = [];
let filteredMeetings = [];

// Bulk Selection State
let selectedMeetings = new Set();
let bulkSelectMode = false;

// Undo/Redo History
let undoStack = [];
let redoStack = [];
const MAX_HISTORY = 50;

// Load meetings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMeetings();
    loadClients();
    loadDashboardStats();
    updateUndoRedoButtons();
    initDarkMode();
});

// Dark Mode Functions
function initDarkMode() {
    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
        updateDarkModeIcon(true);
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        updateDarkModeIcon(false);
    }

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const isDark = e.matches;
            document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
            updateDarkModeIcon(isDark);
        }
    });
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const isDark = currentTheme === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(!isDark);

    // Show feedback toast
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'success');
}

function updateDarkModeIcon(isDark) {
    const icon = document.getElementById('darkModeIcon');
    if (icon) {
        if (isDark) {
            // Sun icon for dark mode (click to switch to light)
            icon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
        } else {
            // Moon icon for light mode (click to switch to dark)
            icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
        }
    }
}

// Load all meetings from API
async function loadMeetings() {
    try {
        const response = await fetch('/api/meetings');
        allMeetings = await response.json();
        filteredMeetings = allMeetings;
        applyFilters();
        // Refresh dashboard stats when meetings are loaded
        loadDashboardStats();
    } catch (error) {
        console.error('Error loading meetings:', error);
        showError('Failed to load meetings');
    }
}

// Load dashboard KPI statistics
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/dashboard/stats');
        const stats = await response.json();

        // Update KPI card values with animation
        updateKpiValue('kpiTotalClients', stats.total_clients);
        updateKpiValue('kpiActiveClients', stats.active_clients);
        updateKpiValue('kpiUpcomingMeetings', stats.upcoming_meetings);
        updateKpiValue('kpiMeetingsToday', stats.meetings_today);
        updateKpiValue('kpiActionRequired', stats.action_required);
        updateKpiValue('kpiTotalMeetings', stats.total_meetings);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Set default values on error
        document.getElementById('kpiTotalClients').textContent = '0';
        document.getElementById('kpiActiveClients').textContent = '0';
        document.getElementById('kpiUpcomingMeetings').textContent = '0';
        document.getElementById('kpiMeetingsToday').textContent = '0';
        document.getElementById('kpiActionRequired').textContent = '0';
        document.getElementById('kpiTotalMeetings').textContent = '0';
    }
}

// Update KPI value with smooth animation
function updateKpiValue(elementId, newValue) {
    const element = document.getElementById(elementId);
    const currentValue = parseInt(element.textContent) || 0;

    if (currentValue === newValue) {
        element.textContent = newValue;
        return;
    }

    // Animate number change
    const duration = 800; // ms
    const steps = 30;
    const stepValue = (newValue - currentValue) / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
            element.textContent = newValue;
            clearInterval(interval);
        } else {
            const intermediateValue = Math.round(currentValue + (stepValue * currentStep));
            element.textContent = intermediateValue;
        }
    }, stepDuration);
}

// Load all clients for autocomplete
async function loadClients() {
    try {
        const response = await fetch('/api/clients');
        allClients = await response.json();
        setupClientDropdown();
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Setup custom dropdown for client selection
function setupClientDropdown() {
    const clientInput = document.getElementById('client');
    const dropdownMenu = document.getElementById('clientDropdownMenu');

    if (!clientInput || !dropdownMenu) return;

    // Show dropdown on focus
    clientInput.addEventListener('focus', () => {
        renderClientDropdown('');
        dropdownMenu.classList.add('show');
    });

    // Filter dropdown on input
    clientInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        renderClientDropdown(searchTerm);
        dropdownMenu.classList.add('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!clientInput.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });
}

// Render client dropdown items
function renderClientDropdown(searchTerm) {
    const dropdownMenu = document.getElementById('clientDropdownMenu');
    const clientInput = document.getElementById('client');

    if (!dropdownMenu) return;

    // Filter clients based on search term
    const filteredClients = allClients.filter(client =>
        client.name.toLowerCase().includes(searchTerm)
    );

    if (filteredClients.length === 0) {
        dropdownMenu.innerHTML = '<div class="dropdown-no-results">No clients found</div>';
        return;
    }

    // Sort clients alphabetically
    filteredClients.sort((a, b) => a.name.localeCompare(b.name));

    dropdownMenu.innerHTML = filteredClients.map(client => {
        const initials = client.name.split(' ')
            .map(word => word[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

        const isSelected = clientInput.value === client.name;

        return `
            <div class="dropdown-item ${isSelected ? 'selected' : ''}" onclick="selectClient('${client.name.replace(/'/g, "\\'")}')">
                <div class="dropdown-item-icon">${initials}</div>
                <span>${client.name}</span>
            </div>
        `;
    }).join('');
}

// Select a client from dropdown
function selectClient(clientName) {
    const clientInput = document.getElementById('client');
    const dropdownMenu = document.getElementById('clientDropdownMenu');

    clientInput.value = clientName;
    dropdownMenu.classList.remove('show');

    // Load addresses for this client
    loadClientAddresses(clientName);

    // Focus on next field
    document.getElementById('peopleConnected')?.focus();
}

// Load addresses for a specific client
async function loadClientAddresses(clientName) {
    if (!clientName || clientName.trim() === '') {
        // Clear address dropdown if no client selected
        const addressSelect = document.getElementById('addressSelect');
        addressSelect.innerHTML = '<option value="">Select existing address or type new...</option>';
        return;
    }

    try {
        const response = await fetch(`/api/clients/${encodeURIComponent(clientName)}/addresses`);
        const addresses = await response.json();

        const addressSelect = document.getElementById('addressSelect');
        addressSelect.innerHTML = '<option value="">Select existing address or type new...</option>';

        // Add existing addresses as options
        addresses.forEach(addr => {
            const option = document.createElement('option');
            option.value = addr.address;
            option.textContent = addr.address;
            addressSelect.appendChild(option);
        });

        // Add "Add New" option at the end
        const newOption = document.createElement('option');
        newOption.value = '__new__';
        newOption.textContent = '+ Add New Address';
        addressSelect.appendChild(newOption);

    } catch (error) {
        console.error('Error loading client addresses:', error);
    }
}

// Toggle between address dropdown and text input
let addressInputMode = 'select'; // 'select' or 'text'

function toggleAddressInputMode() {
    const addressSelect = document.getElementById('addressSelect');
    const addressTextarea = document.getElementById('address');
    const toggleBtn = document.getElementById('toggleAddressInput');

    if (addressInputMode === 'select') {
        // Switch to text input mode
        addressInputMode = 'text';
        addressSelect.style.display = 'none';
        addressTextarea.style.display = 'block';
        addressTextarea.value = '';
        addressTextarea.focus();
        toggleBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
            Use Existing Address
        `;
    } else {
        // Switch to select mode
        addressInputMode = 'select';
        addressSelect.style.display = 'block';
        addressTextarea.style.display = 'none';
        toggleBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Address
        `;
    }
}

// Handle address select change
document.addEventListener('DOMContentLoaded', () => {
    const addressSelect = document.getElementById('addressSelect');
    if (addressSelect) {
        addressSelect.addEventListener('change', (e) => {
            if (e.target.value === '__new__') {
                // User selected "Add New", switch to text input
                toggleAddressInputMode();
            }
        });
    }

    // Watch for client input changes to load addresses
    const clientInput = document.getElementById('client');
    if (clientInput) {
        clientInput.addEventListener('blur', () => {
            const clientName = clientInput.value.trim();
            if (clientName) {
                loadClientAddresses(clientName);
            }
        });
    }
});

// Apply all filters (search + advanced)
function applyFilters() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    const status = document.getElementById('filterStatus')?.value || '';

    filteredMeetings = allMeetings.filter(meeting => {
        // Search filter - search in all fields
        if (searchQuery) {
            const searchableText = [
                meeting.client,
                meeting.people_connected,
                meeting.actions,
                meeting.next_meeting,
                meeting.address,
                meeting.actions_taken
            ].join(' ').toLowerCase();

            if (!searchableText.includes(searchQuery)) {
                return false;
            }
        }

        // Status filter
        if (status === 'has_next' && (!meeting.next_meeting || meeting.next_meeting === '-')) return false;
        if (status === 'no_next' && meeting.next_meeting && meeting.next_meeting !== '-') return false;
        if (status === 'has_actions' && (!meeting.actions_taken || meeting.actions_taken === '-')) return false;
        if (status === 'no_actions' && meeting.actions_taken && meeting.actions_taken !== '-') return false;

        return true;
    });

    displayMeetings(filteredMeetings);
}

// Filter meetings
function filterMeetings() {
    applyFilters();
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    if (document.getElementById('filterStatus')) {
        document.getElementById('filterStatus').value = '';
    }
    applyFilters();
}

// Toggle advanced filters panel
function toggleAdvancedFilters() {
    const panel = document.getElementById('advancedFiltersPanel');
    const icon = document.getElementById('filterToggleIcon');

    if (panel.style.display === 'none') {
        panel.style.display = 'block';
        icon.textContent = '▲';
    } else {
        panel.style.display = 'none';
        icon.textContent = '▼';
    }
}

// Display meetings grouped by client with collapsible sections
function displayMeetings(meetings) {
    const container = document.getElementById('meetingsContainer');

    if (meetings.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No Meetings Found</h2>
                <p>Start by adding your first meeting or import from Excel</p>
            </div>
        `;
        return;
    }

    // Group meetings by client
    const groupedMeetings = meetings.reduce((acc, meeting) => {
        if (!acc[meeting.client]) {
            acc[meeting.client] = [];
        }
        acc[meeting.client].push(meeting);
        return acc;
    }, {});

    console.log('[displayMeetings] Rendering with bulkSelectMode:', bulkSelectMode);

    // Generate HTML for each client group with collapse functionality
    container.innerHTML = Object.entries(groupedMeetings).map(([client, clientMeetings]) => {
        // Find the earliest next meeting date for this client
        let earliestDays = null;
        let earliestDateText = '';

        clientMeetings.forEach(meeting => {
            if (meeting.next_meeting) {
                const dateMatch = meeting.next_meeting.match(/^([A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2},\s+\d{4})/i);
                if (dateMatch) {
                    const daysLeft = calculateDaysLeft(dateMatch[1]);
                    if (daysLeft !== null && (earliestDays === null || daysLeft < earliestDays)) {
                        earliestDays = daysLeft;
                        earliestDateText = dateMatch[1];
                    }
                }
            }
        });

        let nextMeetingBadge = '';
        if (earliestDays !== null) {
            nextMeetingBadge = formatDaysLeft(earliestDays);
        }

        // Get the first meeting (created_at) and last meeting (updated_at) for this client
        const sortedByCreated = [...clientMeetings].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );
        const sortedByUpdated = [...clientMeetings].sort((a, b) =>
            new Date(b.updated_at) - new Date(a.updated_at)
        );

        const firstMeeting = sortedByCreated[0];
        const lastUpdatedMeeting = sortedByUpdated[0];

        const createdDate = firstMeeting.created_at ? new Date(firstMeeting.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : '';

        const lastUpdatedDate = lastUpdatedMeeting.updated_at ? new Date(lastUpdatedMeeting.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }) : '';

        return `
            <div class="client-group" data-client="${client}">
                <div class="client-header" onclick="toggleClientGroup('${client}')">
                    <div>
                        <div class="client-icon">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                        </div>
                        <div class="client-info">
                            <div class="client-name-row">
                                <span class="client-name">${client}</span>
                                ${nextMeetingBadge}
                            </div>
                            <div class="client-meta-row">
                                <span class="meeting-count">${clientMeetings.length} update${clientMeetings.length > 1 ? 's' : ''}</span>
                                ${createdDate ? `<span class="client-date-info">Created: ${createdDate}</span>` : ''}
                                ${lastUpdatedDate ? `<span class="client-date-info">Last Updated: ${lastUpdatedDate}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <span class="collapse-icon" id="collapse-${client}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="18 15 12 9 6 15"></polyline>
                        </svg>
                    </span>
                </div>
                <div class="client-meetings" id="meetings-${client}">
                    ${clientMeetings.map(meeting => createMeetingCard(meeting)).join('')}
                </div>
            </div>
        `;
    }).join('');

    // Initialize drag and drop
    initializeDragAndDrop();

    // Add checkboxes if bulk select mode is enabled
    if (bulkSelectMode) {
        console.log('[displayMeetings] Adding checkboxes post-render');
        addCheckboxesToMeetings();
    }
}

// Add checkboxes to all meeting cards
function addCheckboxesToMeetings() {
    const meetingCards = document.querySelectorAll('.meeting-card');
    console.log('[addCheckboxesToMeetings] Found', meetingCards.length, 'meeting cards');

    meetingCards.forEach(card => {
        // Check if checkbox already exists
        if (card.querySelector('.meeting-checkbox')) {
            return;
        }

        const meetingId = card.getAttribute('data-meeting-id');
        const isSelected = selectedMeetings.has(parseInt(meetingId));

        // Create checkbox element
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'meeting-checkbox';
        checkbox.setAttribute('data-meeting-id', meetingId);
        checkbox.checked = isSelected;
        checkbox.onchange = (event) => toggleMeetingSelection(parseInt(meetingId), event);

        // Add checkbox to card
        card.insertBefore(checkbox, card.firstChild);
        card.classList.add('has-checkbox');

        if (isSelected) {
            card.classList.add('selected');
        }
    });

    console.log('[addCheckboxesToMeetings] Checkboxes added successfully');
}

// Remove checkboxes from all meeting cards
function removeCheckboxesFromMeetings() {
    const checkboxes = document.querySelectorAll('.meeting-checkbox');
    console.log('[removeCheckboxesFromMeetings] Removing', checkboxes.length, 'checkboxes');

    checkboxes.forEach(checkbox => {
        checkbox.remove();
    });

    const meetingCards = document.querySelectorAll('.meeting-card');
    meetingCards.forEach(card => {
        card.classList.remove('has-checkbox', 'selected');
    });

    console.log('[removeCheckboxesFromMeetings] Checkboxes removed successfully');
}

// Toggle client group collapse
function toggleClientGroup(client) {
    const meetingsDiv = document.getElementById(`meetings-${client}`);
    const icon = document.getElementById(`collapse-${client}`);

    if (meetingsDiv.classList.contains('collapsed')) {
        meetingsDiv.classList.remove('collapsed');
        icon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
    } else {
        meetingsDiv.classList.add('collapsed');
        icon.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
        `;
    }
}

// Format meeting date for display
function formatMeetingDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Create HTML for a single meeting card with drag-drop attributes
function createMeetingCard(meeting) {
    // Format the meeting date if it exists
    const meetingDateDisplay = meeting.meeting_date ? formatMeetingDate(meeting.meeting_date) : '';

    // Format the last updated date
    const lastUpdated = meeting.updated_at ? new Date(meeting.updated_at).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }) : '';

    return `
        <div class="meeting-card"
             draggable="true"
             data-meeting-id="${meeting.id}"
             data-client="${meeting.client}"
             ondragstart="handleDragStart(event)"
             ondragend="handleDragEnd(event)"
             ondragover="handleDragOver(event)"
             ondrop="handleDrop(event)">

            <div class="meeting-header">
                <div class="meeting-info">
                    <span class="drag-handle">⋮⋮</span>
                    <h3>Update ${meeting.client_order}</h3>
                    ${meetingDateDisplay ? `<span class="meeting-date-badge">${meetingDateDisplay}</span>` : ''}
                    <button class="calendar-icon-btn" onclick="event.stopPropagation(); openMeetingDatePicker(${meeting.id})" title="Set/Edit Meeting Date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                    ${lastUpdated ? `<span class="last-updated-badge">Last Updated ${lastUpdated}</span>` : ''}
                </div>
                <div class="meeting-actions">
                    <button class="btn btn-edit" onclick="event.stopPropagation(); editMeeting(${meeting.id})" title="Edit meeting">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="btn btn-danger" onclick="event.stopPropagation(); deleteMeeting(${meeting.id}, '${meeting.client}')" title="Delete meeting">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="meeting-details">
                ${createDetailItem('people_connected', 'People Connected', meeting.people_connected, meeting.id)}
                ${createDetailItem('actions', 'Actions', meeting.actions, meeting.id)}
                ${createDetailItem('next_meeting', 'Next Meeting', meeting.next_meeting, meeting.id, true)}
                ${createDetailItem('address', 'Address', meeting.address, meeting.id)}
                ${createDetailItem('actions_taken', 'Actions Taken', meeting.actions_taken, meeting.id)}
            </div>
        </div>
    `;
}

// Calculate days left until a date
function calculateDaysLeft(dateString) {
    const match = dateString.match(/[A-Za-z]{3},\s+([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/i);
    if (!match) return null;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames.indexOf(match[1]);
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);

    if (month === -1) return null;

    const meetingDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    meetingDate.setHours(0, 0, 0, 0);

    const diffTime = meetingDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

// Format days left text
function formatDaysLeft(days) {
    if (days === 0) return '<span class="days-left days-today">Today</span>';
    if (days === 1) return '<span class="days-left days-soon">Tom</span>';
    if (days < 0) return `<span class="days-left days-overdue">${Math.abs(days)}d ago</span>`;
    if (days <= 7) return `<span class="days-left days-soon">${days} days</span>`;
    if (days <= 30) return `<span class="days-left days-normal">${days} days</span>`;
    return `<span class="days-left days-future">${days} days</span>`;
}

// Create detail item with inline editing
function createDetailItem(field, label, value, meetingId, showCalendar = false) {
    const displayValue = value || '-';

    // For next_meeting field, extract date and notes separately
    if (showCalendar) {
        // Extract date from the beginning (format: Fri, Dec 6, 2024)
        const dateMatch = displayValue.match(/^([A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2},\s+\d{4})\s*-?\s*/i);
        const extractedDate = dateMatch ? dateMatch[1] : '';
        const notes = dateMatch ? displayValue.replace(dateMatch[0], '').trim() : displayValue;

        // Calculate days left
        let daysLeftHtml = '';
        if (extractedDate) {
            const daysLeft = calculateDaysLeft(extractedDate);
            if (daysLeft !== null) {
                daysLeftHtml = formatDaysLeft(daysLeft);
            }
        }

        return `
            <div class="detail-item detail-item-with-date" data-field="${field}">
                <label class="label-with-date">
                    <span class="label-text">${label}</span>
                    ${extractedDate ? `<span class="date-display">- ${extractedDate}</span>` : ''}
                    ${daysLeftHtml}
                    <button class="calendar-icon-btn calendar-header-icon" onclick="event.stopPropagation(); openDatePicker(${meetingId}, '${field}')" title="Add/Edit Next Meeting Date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                    </button>
                </label>
                <p onclick="enableInlineEdit(this, ${meetingId}, '${field}')" data-field="${field}">${notes && notes !== '-' ? notes : '-'}</p>
            </div>
        `;
    }

    return `
        <div class="detail-item" data-field="${field}">
            <label>${label}</label>
            <p onclick="enableInlineEdit(this, ${meetingId}, '${field}')" data-field="${field}">${displayValue}</p>
        </div>
    `;
}

// Enable inline editing
async function enableInlineEdit(element, meetingId, field) {
    const currentValue = element.textContent === '-' ? '' : element.textContent;

    // Special handling for address field - show dropdown
    if (field === 'address') {
        await enableInlineAddressEdit(element, meetingId, currentValue);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.className = 'inline-edit';
    textarea.value = currentValue;

    const actions = document.createElement('div');
    actions.className = 'inline-edit-actions';
    actions.innerHTML = `
        <button class="btn btn-primary" onclick="saveInlineEdit(${meetingId}, '${field}', this)">Save</button>
        <button class="btn btn-secondary" onclick="cancelInlineEdit(this)">Cancel</button>
    `;

    element.replaceWith(textarea);
    textarea.parentNode.appendChild(actions);
    textarea.focus();
}

// Enable inline address editing with dropdown
async function enableInlineAddressEdit(element, meetingId, currentValue) {
    // Get the meeting to find the client name
    const response = await fetch(`/api/meetings/${meetingId}`);
    const meeting = await response.json();
    const clientName = meeting.client;

    // Load addresses for this client
    const addressesResponse = await fetch(`/api/clients/${encodeURIComponent(clientName)}/addresses`);
    const addresses = await addressesResponse.json();

    // Create wrapper div
    const wrapper = document.createElement('div');
    wrapper.className = 'inline-address-edit-wrapper';

    // Create select dropdown
    const select = document.createElement('select');
    select.className = 'inline-edit inline-address-select';
    select.dataset.meetingId = meetingId;

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select existing address or type new...';
    select.appendChild(defaultOption);

    // Add existing addresses
    addresses.forEach(addr => {
        const option = document.createElement('option');
        option.value = addr.address;
        option.textContent = addr.address;
        if (addr.address === currentValue) {
            option.selected = true;
        }
        select.appendChild(option);
    });

    // Add "Type new" option
    const newOption = document.createElement('option');
    newOption.value = '__new__';
    newOption.textContent = '+ Type New Address';
    select.appendChild(newOption);

    // Create textarea (hidden by default)
    const textarea = document.createElement('textarea');
    textarea.className = 'inline-edit inline-address-textarea';
    textarea.style.display = 'none';
    textarea.value = currentValue;

    // Handle select change
    select.addEventListener('change', (e) => {
        if (e.target.value === '__new__') {
            select.style.display = 'none';
            textarea.style.display = 'block';
            textarea.value = currentValue;
            textarea.focus();
        }
    });

    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-secondary btn-small inline-address-toggle';
    toggleBtn.type = 'button';
    toggleBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Type New
    `;
    toggleBtn.onclick = () => {
        if (select.style.display !== 'none') {
            // Switch to textarea
            select.style.display = 'none';
            textarea.style.display = 'block';
            textarea.focus();
            toggleBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                </svg>
                Use Existing
            `;
        } else {
            // Switch to select
            select.style.display = 'block';
            textarea.style.display = 'none';
            toggleBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Type New
            `;
        }
    };

    // Create actions
    const actions = document.createElement('div');
    actions.className = 'inline-edit-actions';
    actions.innerHTML = `
        <button class="btn btn-primary" onclick="saveInlineAddressEdit(${meetingId}, this)">Save</button>
        <button class="btn btn-secondary" onclick="cancelInlineEdit(this)">Cancel</button>
    `;

    // Build structure
    wrapper.appendChild(select);
    wrapper.appendChild(textarea);
    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(actions);

    element.replaceWith(wrapper);
    select.focus();
}

// Save inline address edit
async function saveInlineAddressEdit(meetingId, button) {
    const container = button.parentNode.parentNode;
    const select = container.querySelector('.inline-address-select');
    const textarea = container.querySelector('.inline-address-textarea');

    // Determine which input is active
    let newValue = '';
    if (select.style.display !== 'none') {
        // Using dropdown
        const selectValue = select.value;
        newValue = (selectValue && selectValue !== '__new__') ? selectValue : '';
    } else {
        // Using textarea
        newValue = textarea.value.trim();
    }

    try {
        // Get current meeting data
        const response = await fetch(`/api/meetings/${meetingId}`);
        const previousMeeting = await response.json();
        const meeting = {...previousMeeting};

        // Update the address field
        meeting.address = newValue || null;

        // Save to server
        const updateResponse = await fetch(`/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meeting)
        });

        if (updateResponse.ok) {
            const updatedMeeting = await updateResponse.json();

            // Save to undo stack
            saveState('update', { id: meetingId, previous: previousMeeting, current: updatedMeeting });

            // Replace with display text
            const p = document.createElement('p');
            p.onclick = () => enableInlineEdit(p, meetingId, 'address');
            p.dataset.field = 'address';
            p.textContent = newValue || '-';

            container.replaceWith(p);

            // Reload data
            await loadMeetings();
            showSuccess('Address updated successfully');
        } else {
            showError('Failed to update address');
        }
    } catch (error) {
        console.error('Error saving address:', error);
        showError('Failed to update address');
    }
}

// Save inline edit
async function saveInlineEdit(meetingId, field, button) {
    const container = button.parentNode.parentNode;
    const textarea = container.querySelector('textarea');
    const newValue = textarea.value.trim();

    try {
        // Get current meeting data
        const response = await fetch(`/api/meetings/${meetingId}`);
        const previousMeeting = await response.json();
        const meeting = {...previousMeeting};

        // Update the specific field
        meeting[field] = newValue || null;

        // Save to server
        const updateResponse = await fetch(`/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meeting)
        });

        if (updateResponse.ok) {
            const updatedMeeting = await updateResponse.json();

            // Save to undo stack
            saveState('update', { id: meetingId, previous: previousMeeting, current: updatedMeeting });

            // Replace with display text
            const p = document.createElement('p');
            p.onclick = () => enableInlineEdit(p, meetingId, field);
            p.dataset.field = field;
            p.textContent = newValue || '-';

            textarea.replaceWith(p);
            container.querySelector('.inline-edit-actions').remove();

            // Reload data
            await loadMeetings();
            showSuccess('Updated successfully');
        } else {
            showError('Failed to update');
        }
    } catch (error) {
        console.error('Error saving:', error);
        showError('Failed to update');
    }
}

// Cancel inline edit
function cancelInlineEdit(button) {
    const container = button.parentNode.parentNode;
    const textarea = container.querySelector('textarea');
    const field = container.querySelector('label').textContent;
    const meetingId = parseInt(textarea.parentNode.parentNode.dataset.meetingId);

    // Find original value from allMeetings
    const meeting = allMeetings.find(m => m.id === meetingId);
    const fieldKey = container.querySelector('.inline-edit-actions').previousSibling.dataset.field;
    const originalValue = meeting ? (meeting[fieldKey] || '-') : '-';

    const p = document.createElement('p');
    p.onclick = () => enableInlineEdit(p, meetingId, fieldKey);
    p.dataset.field = fieldKey;
    p.textContent = originalValue;

    textarea.replaceWith(p);
    container.querySelector('.inline-edit-actions').remove();
}

// Drag and Drop functionality
let draggedElement = null;

function initializeDragAndDrop() {
    // Already handled by inline event handlers
}

function handleDragStart(event) {
    draggedElement = event.target;
    event.target.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', event.target.innerHTML);
}

function handleDragEnd(event) {
    event.target.classList.remove('dragging');
    document.querySelectorAll('.meeting-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

function handleDragOver(event) {
    if (event.preventDefault) {
        event.preventDefault();
    }
    event.dataTransfer.dropEffect = 'move';

    const target = event.target.closest('.meeting-card');
    if (target && target !== draggedElement) {
        target.classList.add('drag-over');
    }

    return false;
}

function handleDrop(event) {
    if (event.stopPropagation) {
        event.stopPropagation();
    }

    event.preventDefault();

    const target = event.target.closest('.meeting-card');
    if (target && target !== draggedElement) {
        const draggedClient = draggedElement.dataset.client;
        const targetClient = target.dataset.client;

        // Only allow reordering within same client
        if (draggedClient === targetClient) {
            const draggedId = parseInt(draggedElement.dataset.meetingId);
            const targetId = parseInt(target.dataset.meetingId);

            reorderMeetings(draggedId, targetId);
        } else {
            showError('Cannot move between different clients');
        }
    }

    target?.classList.remove('drag-over');
    return false;
}

// Reorder meetings on server
async function reorderMeetings(draggedId, targetId) {
    try {
        const response = await fetch('/api/meetings/reorder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                dragged_id: draggedId,
                target_id: targetId
            })
        });

        if (response.ok) {
            await loadMeetings();
            showSuccess('Order updated');
        } else {
            showError('Failed to reorder');
        }
    } catch (error) {
        console.error('Error reordering:', error);
        showError('Failed to reorder');
    }
}

// Export to Excel
async function exportToExcel() {
    try {
        // Use filtered meetings if available, otherwise use all meetings
        const meetingsToExport = filteredMeetings.length > 0 ? filteredMeetings : allMeetings;

        if (meetingsToExport.length === 0) {
            showError('No meetings to export');
            return;
        }

        const response = await fetch('/api/export/excel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                meeting_ids: meetingsToExport.map(m => m.id)
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meetings_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showSuccess(`Exported ${meetingsToExport.length} meetings to Excel`);
        } else {
            const errorData = await response.json();
            showError(errorData.detail || 'Failed to export');
        }
    } catch (error) {
        console.error('Error exporting:', error);
        showError('Failed to export: ' + error.message);
    }
}

// Export to PDF
async function exportToPDF() {
    try {
        // Use filtered meetings if available, otherwise use all meetings
        const meetingsToExport = filteredMeetings.length > 0 ? filteredMeetings : allMeetings;

        if (meetingsToExport.length === 0) {
            showError('No meetings to export');
            return;
        }

        const response = await fetch('/api/export/pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                meeting_ids: meetingsToExport.map(m => m.id)
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `meetings_report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
            showSuccess(`Exported ${meetingsToExport.length} meetings to PDF`);
        } else {
            const errorData = await response.json();
            showError(errorData.detail || 'Failed to export PDF');
        }
    } catch (error) {
        console.error('Error exporting:', error);
        showError('Failed to export PDF: ' + error.message);
    }
}

// Open add meeting modal
function openAddModal() {
    document.getElementById('modalTitle').textContent = 'Add Meeting';
    document.getElementById('meetingForm').reset();
    document.getElementById('meetingId').value = '';

    // Reset address field to select mode
    addressInputMode = 'select';
    document.getElementById('addressSelect').style.display = 'block';
    document.getElementById('address').style.display = 'none';
    document.getElementById('addressSelect').innerHTML = '<option value="">Select existing address or type new...</option>';
    document.getElementById('toggleAddressInput').innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        Add New Address
    `;

    document.getElementById('meetingModal').style.display = 'block';
}

// Open edit meeting modal
async function editMeeting(id) {
    try {
        const response = await fetch(`/api/meetings/${id}`);
        const meeting = await response.json();

        document.getElementById('modalTitle').textContent = 'Edit Meeting';
        document.getElementById('meetingId').value = meeting.id;
        document.getElementById('client').value = meeting.client || '';
        document.getElementById('peopleConnected').value = meeting.people_connected || '';
        document.getElementById('actions').value = meeting.actions || '';
        document.getElementById('nextMeeting').value = meeting.next_meeting || '';
        document.getElementById('actionsTaken').value = meeting.actions_taken || '';

        // Load addresses for the client
        if (meeting.client) {
            await loadClientAddresses(meeting.client);

            // Check if current address exists in dropdown
            const addressSelect = document.getElementById('addressSelect');
            const currentAddress = meeting.address || '';
            let addressFound = false;

            for (let option of addressSelect.options) {
                if (option.value === currentAddress) {
                    addressSelect.value = currentAddress;
                    addressFound = true;
                    break;
                }
            }

            // If address not in dropdown, switch to text mode and set it
            if (!addressFound && currentAddress) {
                addressInputMode = 'select'; // Set to select first so toggle works
                toggleAddressInputMode(); // This will switch to text mode
                document.getElementById('address').value = currentAddress;
            } else if (!addressFound) {
                // No address at all
                addressInputMode = 'select';
                document.getElementById('addressSelect').style.display = 'block';
                document.getElementById('address').style.display = 'none';
            } else {
                // Address found in dropdown
                addressInputMode = 'select';
                document.getElementById('addressSelect').style.display = 'block';
                document.getElementById('address').style.display = 'none';
            }
        }

        document.getElementById('meetingModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading meeting:', error);
        showError('Failed to load meeting details');
    }
}

// Save meeting (create or update)
async function saveMeeting(event) {
    event.preventDefault();

    const meetingId = document.getElementById('meetingId').value;

    // Get address from either dropdown or text input
    let addressValue = '';
    if (addressInputMode === 'select') {
        const selectValue = document.getElementById('addressSelect').value;
        addressValue = (selectValue && selectValue !== '__new__') ? selectValue : '';
    } else {
        addressValue = document.getElementById('address').value;
    }

    const meetingData = {
        client: document.getElementById('client').value,
        people_connected: document.getElementById('peopleConnected').value,
        actions: document.getElementById('actions').value,
        next_meeting: document.getElementById('nextMeeting').value,
        address: addressValue,
        actions_taken: document.getElementById('actionsTaken').value
    };

    // Auto-capture today's date for new meetings
    if (!meetingId) {
        const today = new Date();
        meetingData.meeting_date = today.toISOString().split('T')[0];
    }

    try {
        let previousData = null;

        // If updating, get the current state for undo
        if (meetingId) {
            const currentResponse = await fetch(`/api/meetings/${meetingId}`);
            previousData = await currentResponse.json();
        }

        const url = meetingId ? `/api/meetings/${meetingId}` : '/api/meetings';
        const method = meetingId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meetingData)
        });

        if (response.ok) {
            const savedMeeting = await response.json();

            // Save to undo stack
            if (meetingId) {
                saveState('update', { id: parseInt(meetingId), previous: previousData, current: savedMeeting });
            } else {
                saveState('create', savedMeeting);
            }

            closeModal();
            loadMeetings();
            loadClients();
            showSuccess(meetingId ? 'Meeting updated successfully' : 'Meeting added successfully');
        } else {
            showError('Failed to save meeting');
        }
    } catch (error) {
        console.error('Error saving meeting:', error);
        showError('Failed to save meeting');
    }
}

// Delete meeting with custom confirmation
async function deleteMeeting(id, clientName) {
    showConfirmDialog(
        'Delete Meeting',
        `Are you sure you want to delete this meeting for <strong>${clientName}</strong>?`,
        'Delete',
        'Cancel',
        async () => {
            try {
                // Get current state for undo before deleting
                const currentResponse = await fetch(`/api/meetings/${id}`);
                const deletedMeeting = await currentResponse.json();

                const response = await fetch(`/api/meetings/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    // Save to undo stack
                    saveState('delete', deletedMeeting);

                    loadMeetings();
                    loadClients();
                    showSuccess('Meeting deleted successfully');
                } else {
                    showError('Failed to delete meeting');
                }
            } catch (error) {
                console.error('Error deleting meeting:', error);
                showError('Failed to delete meeting');
            }
        }
    );
}

// Custom confirmation dialog
function showConfirmDialog(title, message, confirmText, cancelText, onConfirm) {
    // Remove any existing confirm dialog
    const existingDialog = document.getElementById('customConfirmDialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'customConfirmDialog';
    overlay.className = 'confirm-overlay';

    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    dialog.innerHTML = `
        <div class="confirm-header">
            <div class="confirm-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
            <h3>${title}</h3>
        </div>
        <div class="confirm-body">
            <p>${message}</p>
        </div>
        <div class="confirm-actions">
            <button class="btn btn-secondary confirm-cancel">${cancelText}</button>
            <button class="btn btn-danger-solid confirm-confirm">${confirmText}</button>
        </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // Trigger animation
    setTimeout(() => {
        overlay.classList.add('show');
        dialog.classList.add('show');
    }, 10);

    // Handle cancel
    const cancelBtn = dialog.querySelector('.confirm-cancel');
    cancelBtn.onclick = () => {
        closeConfirmDialog(overlay);
    };

    // Handle confirm
    const confirmBtn = dialog.querySelector('.confirm-confirm');
    confirmBtn.onclick = () => {
        closeConfirmDialog(overlay);
        if (onConfirm) onConfirm();
    };

    // Close on overlay click
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            closeConfirmDialog(overlay);
        }
    };
}

function closeConfirmDialog(overlay) {
    overlay.classList.remove('show');
    const dialog = overlay.querySelector('.confirm-dialog');
    dialog.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
}

// Close modal
function closeModal() {
    document.getElementById('meetingModal').style.display = 'none';
}


// Show success message
function showSuccess(message) {
    showToast(message, 'success');
}

// Show error message
function showError(message) {
    showToast(message, 'error');
}

// Toast notification system
function showToast(message, type = 'success') {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✓' : '✕';

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    toastContainer.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto remove after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Meeting Date Picker (for Update header date)
function openMeetingDatePicker(meetingId) {
    // Remove any existing date picker
    const existingPicker = document.getElementById('meetingDatePickerModal');
    if (existingPicker) {
        existingPicker.remove();
    }

    // Create date picker modal
    const modal = document.createElement('div');
    modal.id = 'meetingDatePickerModal';
    modal.className = 'date-picker-overlay';

    // Get current meeting date if exists
    const meeting = allMeetings.find(m => m.id === meetingId);
    const currentValue = meeting && meeting.meeting_date ? meeting.meeting_date : '';

    modal.innerHTML = `
        <div class="date-picker-modal">
            <div class="date-picker-header">
                <h3>Set Meeting Date</h3>
                <button class="date-picker-close" onclick="closeMeetingDatePicker()">×</button>
            </div>
            <div class="date-picker-body">
                <input type="date" id="meetingDateInput" class="date-input" value="${currentValue}">
                <div class="date-picker-actions">
                    <button class="btn btn-secondary" onclick="closeMeetingDatePicker()">Cancel</button>
                    ${currentValue ? `<button class="btn btn-danger-outline" onclick="clearMeetingDate(${meetingId})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Clear Date
                    </button>` : ''}
                    <button class="btn btn-primary" onclick="saveMeetingDate(${meetingId})">Save Date</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
        modal.querySelector('.date-picker-modal').classList.add('show');
    }, 10);

    // Focus on date input
    setTimeout(() => document.getElementById('meetingDateInput').focus(), 100);
}

function closeMeetingDatePicker() {
    const modal = document.getElementById('meetingDatePickerModal');
    if (modal) {
        modal.classList.remove('show');
        modal.querySelector('.date-picker-modal').classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

async function saveMeetingDate(meetingId) {
    const dateInput = document.getElementById('meetingDateInput');
    const selectedDate = dateInput.value;

    if (!selectedDate) {
        showError('Please select a date');
        return;
    }

    try {
        // Get current meeting data
        const response = await fetch(`/api/meetings/${meetingId}`);
        const previousMeeting = await response.json();
        const meeting = {...previousMeeting};

        // Update the meeting_date field
        meeting.meeting_date = selectedDate;

        // Save to server
        const updateResponse = await fetch(`/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meeting)
        });

        if (updateResponse.ok) {
            const updatedMeeting = await updateResponse.json();

            // Save to undo stack
            saveState('update', { id: meetingId, previous: previousMeeting, current: updatedMeeting });

            closeMeetingDatePicker();
            await loadMeetings();
            showSuccess('Meeting date updated');
        } else {
            showError('Failed to update date');
        }
    } catch (error) {
        console.error('Error saving date:', error);
        showError('Failed to update date');
    }
}

async function clearMeetingDate(meetingId) {
    try {
        // Get current meeting data
        const response = await fetch(`/api/meetings/${meetingId}`);
        const previousMeeting = await response.json();
        const meeting = {...previousMeeting};

        // Clear the meeting_date field
        meeting.meeting_date = null;

        // Save to server
        const updateResponse = await fetch(`/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meeting)
        });

        if (updateResponse.ok) {
            const updatedMeeting = await updateResponse.json();

            // Save to undo stack
            saveState('update', { id: meetingId, previous: previousMeeting, current: updatedMeeting });

            closeMeetingDatePicker();
            await loadMeetings();
            showSuccess('Meeting date cleared');
        } else {
            showError('Failed to clear date');
        }
    } catch (error) {
        console.error('Error clearing date:', error);
        showError('Failed to clear date');
    }
}

// Date Picker functionality (for Next Meeting field)
function openDatePicker(meetingId, field) {
    // Remove any existing date picker
    const existingPicker = document.getElementById('datePickerModal');
    if (existingPicker) {
        existingPicker.remove();
    }

    // Create date picker modal
    const modal = document.createElement('div');
    modal.id = 'datePickerModal';
    modal.className = 'date-picker-overlay';

    // Get current date value if exists
    const meeting = allMeetings.find(m => m.id === meetingId);
    const currentValue = meeting && meeting[field] ? extractDateFromText(meeting[field]) : '';

    // Check if there's any date in the field (not just the extracted date)
    const hasDate = meeting && meeting[field] && meeting[field].match(/[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2},\s+\d{4}/i);

    // Extract time if exists in the current value
    const currentTime = meeting && meeting[field] ? extractTimeFromText(meeting[field]) : '';

    modal.innerHTML = `
        <div class="date-picker-modal">
            <div class="date-picker-header">
                <h3>Select Next Meeting Date & Time</h3>
                <button class="date-picker-close" onclick="closeDatePicker()">×</button>
            </div>
            <div class="date-picker-body">
                <div class="date-time-inputs">
                    <div class="form-group">
                        <label for="dateInput">Date</label>
                        <input type="date" id="dateInput" class="date-input" value="${currentValue}">
                    </div>
                    <div class="form-group">
                        <label for="timeInput">Time (Optional)</label>
                        <input type="time" id="timeInput" class="time-input" value="${currentTime}">
                    </div>
                </div>
                <div class="quick-time-buttons">
                    <button type="button" class="btn-quick-time" onclick="setQuickTime('09:00')">9:00 AM</button>
                    <button type="button" class="btn-quick-time" onclick="setQuickTime('10:00')">10:00 AM</button>
                    <button type="button" class="btn-quick-time" onclick="setQuickTime('11:00')">11:00 AM</button>
                    <button type="button" class="btn-quick-time" onclick="setQuickTime('14:00')">2:00 PM</button>
                    <button type="button" class="btn-quick-time" onclick="setQuickTime('15:00')">3:00 PM</button>
                    <button type="button" class="btn-quick-time" onclick="setQuickTime('16:00')">4:00 PM</button>
                </div>
                <div class="date-picker-actions">
                    <button class="btn btn-secondary" onclick="closeDatePicker()">Cancel</button>
                    ${hasDate ? `<button class="btn btn-danger-outline" onclick="clearDateSelection(${meetingId}, '${field}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                        Clear Date
                    </button>` : ''}
                    <button class="btn btn-primary" onclick="saveDateSelection(${meetingId}, '${field}')">Save</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Trigger animation
    setTimeout(() => {
        modal.classList.add('show');
        modal.querySelector('.date-picker-modal').classList.add('show');
    }, 10);

    // Focus on date input
    setTimeout(() => document.getElementById('dateInput').focus(), 100);
}

function extractDateFromText(text) {
    // Try to extract ISO date format (YYYY-MM-DD) from text
    const isoMatch = text.match(/\d{4}-\d{2}-\d{2}/);
    if (isoMatch) return isoMatch[0];

    // Try to parse various date formats
    const dateMatch = text.match(/\d{1,2}[-\/]\d{1,2}[-\/]\d{4}/);
    if (dateMatch) {
        const parts = dateMatch[0].split(/[-\/]/);
        // Assume DD-MM-YYYY or MM-DD-YYYY format
        if (parseInt(parts[0]) > 12) {
            // DD-MM-YYYY
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        } else {
            // MM-DD-YYYY
            return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
        }
    }

    return '';
}

function extractTimeFromText(text) {
    // Try to extract time in various formats
    // Match HH:MM AM/PM or HH:MM (24-hour)
    const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2];
        const meridiem = timeMatch[3];

        // Convert to 24-hour format if AM/PM is present
        if (meridiem) {
            if (meridiem.toUpperCase() === 'PM' && hours !== 12) {
                hours += 12;
            } else if (meridiem.toUpperCase() === 'AM' && hours === 12) {
                hours = 0;
            }
        }

        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return '';
}

function setQuickTime(time) {
    const timeInput = document.getElementById('timeInput');
    if (timeInput) {
        timeInput.value = time;
        timeInput.focus();
    }
}

function closeDatePicker() {
    const modal = document.getElementById('datePickerModal');
    if (modal) {
        modal.classList.remove('show');
        modal.querySelector('.date-picker-modal').classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

async function clearDateSelection(meetingId, field) {
    try {
        // Get current meeting data
        const response = await fetch(`/api/meetings/${meetingId}`);
        const previousMeeting = await response.json();
        const meeting = {...previousMeeting};

        // Get existing content (notes)
        let existingContent = meeting[field] || '';

        // Remove date from the beginning
        existingContent = existingContent.replace(/^[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2},\s+\d{4}\s*-?\s*/i, '').trim();

        // Set to notes only (or null if empty)
        meeting[field] = existingContent && existingContent !== '-' ? existingContent : null;

        // Save to server
        const updateResponse = await fetch(`/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meeting)
        });

        if (updateResponse.ok) {
            const updatedMeeting = await updateResponse.json();

            // Save to undo stack
            saveState('update', { id: meetingId, previous: previousMeeting, current: updatedMeeting });

            closeDatePicker();
            await loadMeetings();
            showSuccess('Date cleared successfully');
        } else {
            showError('Failed to clear date');
        }
    } catch (error) {
        console.error('Error clearing date:', error);
        showError('Failed to clear date');
    }
}

async function saveDateSelection(meetingId, field) {
    const dateInput = document.getElementById('dateInput');
    const timeInput = document.getElementById('timeInput');
    const selectedDate = dateInput.value;
    const selectedTime = timeInput ? timeInput.value : '';

    if (!selectedDate) {
        showError('Please select a date');
        return;
    }

    // Validate that the date is not in the past
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    selectedDateObj.setHours(0, 0, 0, 0);

    if (selectedDateObj < today) {
        showError('Cannot set a past date for next meeting');
        return;
    }

    try {
        // Format date nicely
        const dateObj = new Date(selectedDate);
        const formattedDate = dateObj.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        // Format time if provided
        let formattedDateTime = formattedDate;
        if (selectedTime) {
            const [hours, minutes] = selectedTime.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
            formattedDateTime = `${formattedDate} at ${displayHour}:${minutes} ${ampm}`;
        }

        // Get current meeting data
        const response = await fetch(`/api/meetings/${meetingId}`);
        const previousMeeting = await response.json();
        const meeting = {...previousMeeting};

        // Get existing content (notes)
        let existingContent = meeting[field] || '';

        // Remove any existing date and time from the beginning (if present)
        // Pattern matches dates like "Fri, Dec 6, 2024" with optional time
        existingContent = existingContent.replace(/^[A-Za-z]{3},\s+[A-Za-z]{3}\s+\d{1,2},\s+\d{4}(\s+at\s+\d{1,2}:\d{2}\s+(AM|PM))?\s*-?\s*/i, '').trim();

        // Prepend the new date (with time if provided) to existing notes
        if (existingContent && existingContent !== '-') {
            meeting[field] = `${formattedDateTime} - ${existingContent}`;
        } else {
            meeting[field] = formattedDateTime;
        }

        // Save to server
        const updateResponse = await fetch(`/api/meetings/${meetingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(meeting)
        });

        if (updateResponse.ok) {
            const updatedMeeting = await updateResponse.json();

            // Save to undo stack
            saveState('update', { id: meetingId, previous: previousMeeting, current: updatedMeeting });

            closeDatePicker();
            await loadMeetings();
            showSuccess('Next meeting date added');
        } else {
            showError('Failed to update date');
        }
    } catch (error) {
        console.error('Error saving date:', error);
        showError('Failed to update date');
    }
}

// Export Dropdown Toggle
function toggleExportDropdown() {
    const menu = document.getElementById('exportDropdownMenu');
    menu.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.export-dropdown');
    const menu = document.getElementById('exportDropdownMenu');

    if (dropdown && !dropdown.contains(e.target)) {
        menu.classList.remove('show');
    }
});

// Undo/Redo Functionality
function saveState(action, data) {
    const state = {
        action: action,
        data: data,
        timestamp: Date.now()
    };

    undoStack.push(state);

    // Limit stack size
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }

    // Clear redo stack when new action is performed
    redoStack = [];

    updateUndoRedoButtons();
}

async function undo() {
    if (undoStack.length === 0) return;

    const state = undoStack.pop();

    try {
        switch (state.action) {
            case 'create':
                // Undo create = delete the created meeting
                await fetch(`/api/meetings/${state.data.id}`, { method: 'DELETE' });
                redoStack.push({ action: 'create', data: state.data });
                showSuccess('Undone: Meeting creation');
                break;

            case 'update':
                // Undo update = restore previous values
                await fetch(`/api/meetings/${state.data.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(state.data.previous)
                });
                redoStack.push({ action: 'update', data: { id: state.data.id, previous: state.data.previous, current: state.data.current } });
                showSuccess('Undone: Meeting update');
                break;

            case 'delete':
                // Undo delete = recreate the deleted meeting
                const response = await fetch('/api/meetings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(state.data)
                });
                const newMeeting = await response.json();
                redoStack.push({ action: 'delete', data: { ...state.data, id: newMeeting.id } });
                showSuccess('Undone: Meeting deletion');
                break;
        }

        await loadMeetings();
        await loadClients();
    } catch (error) {
        console.error('Undo error:', error);
        showError('Failed to undo action');
        undoStack.push(state); // Restore state if failed
    }

    updateUndoRedoButtons();
}

async function redo() {
    if (redoStack.length === 0) return;

    const state = redoStack.pop();

    try {
        switch (state.action) {
            case 'create':
                // Redo create = recreate the meeting
                const createResponse = await fetch('/api/meetings', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(state.data)
                });
                const createdMeeting = await createResponse.json();
                undoStack.push({ action: 'create', data: createdMeeting });
                showSuccess('Redone: Meeting creation');
                break;

            case 'update':
                // Redo update = apply the new values (current)
                await fetch(`/api/meetings/${state.data.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(state.data.current)
                });
                undoStack.push({ action: 'update', data: { id: state.data.id, previous: state.data.previous, current: state.data.current } });
                showSuccess('Redone: Meeting update');
                break;

            case 'delete':
                // Redo delete = delete the meeting again
                await fetch(`/api/meetings/${state.data.id}`, { method: 'DELETE' });
                undoStack.push({ action: 'delete', data: state.data });
                showSuccess('Redone: Meeting deletion');
                break;
        }

        await loadMeetings();
        await loadClients();
    } catch (error) {
        console.error('Redo error:', error);
        showError('Failed to redo action');
        redoStack.push(state); // Restore state if failed
    }

    updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');

    if (undoBtn) {
        undoBtn.disabled = undoStack.length === 0;
    }
    if (redoBtn) {
        redoBtn.disabled = redoStack.length === 0;
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const meetingModal = document.getElementById('meetingModal');
    const datePickerModal = document.getElementById('datePickerModal');
    const meetingDatePickerModal = document.getElementById('meetingDatePickerModal');
    const calendarModal = document.getElementById('calendarModal');

    if (event.target === meetingModal) {
        closeModal();
    }
    if (event.target === datePickerModal) {
        closeDatePicker();
    }
    if (event.target === meetingDatePickerModal) {
        closeMeetingDatePicker();
    }
    if (event.target === calendarModal) {
        closeCalendarView();
    }
}

// ============================================
// BULK DELETE FUNCTIONALITY
// ============================================

// Toggle bulk select mode
function toggleBulkSelectMode() {
    bulkSelectMode = !bulkSelectMode;
    selectedMeetings.clear();

    console.log('Bulk select mode toggled:', bulkSelectMode);

    // Update toggle button appearance
    const toggleBtn = document.getElementById('bulkSelectToggle');
    if (bulkSelectMode) {
        toggleBtn.classList.add('active-toggle');
        toggleBtn.style.background = '#6366F1';
        toggleBtn.style.color = 'white';
        toggleBtn.querySelector('svg').style.stroke = 'white';
        showSuccess('Bulk selection mode enabled - Click checkboxes to select meetings');
        console.log('Bulk mode ON - Adding checkboxes');
        // Add checkboxes without re-rendering everything
        addCheckboxesToMeetings();
    } else {
        toggleBtn.classList.remove('active-toggle');
        toggleBtn.style.background = '';
        toggleBtn.style.color = '';
        toggleBtn.querySelector('svg').style.stroke = '';
        console.log('Bulk mode OFF - Removing checkboxes');
        // Remove checkboxes
        removeCheckboxesFromMeetings();
    }

    updateBulkActionsBar();
}

// Update bulk actions bar visibility
function updateBulkActionsBar() {
    const bulkActionsBar = document.getElementById('bulkActionsBar');
    const selectedCount = document.getElementById('selectedCount');

    if (selectedMeetings.size > 0) {
        bulkActionsBar.style.display = 'flex';
        selectedCount.textContent = `${selectedMeetings.size} selected`;
    } else {
        bulkActionsBar.style.display = 'none';
    }
}

// Toggle meeting selection
function toggleMeetingSelection(meetingId, event) {
    event.stopPropagation();

    if (selectedMeetings.has(meetingId)) {
        selectedMeetings.delete(meetingId);
    } else {
        selectedMeetings.add(meetingId);
    }

    // Update checkbox state
    const checkbox = document.querySelector(`input[data-meeting-id="${meetingId}"]`);
    if (checkbox) {
        checkbox.checked = selectedMeetings.has(meetingId);
    }

    // Update card styling
    const card = document.querySelector(`.meeting-card[data-meeting-id="${meetingId}"]`);
    if (card) {
        if (selectedMeetings.has(meetingId)) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    }

    updateBulkActionsBar();
}

// Clear all selections
function clearSelection() {
    selectedMeetings.clear();
    document.querySelectorAll('.meeting-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    document.querySelectorAll('.meeting-card').forEach(card => {
        card.classList.remove('selected');
    });
    updateBulkActionsBar();
}

// Bulk delete meetings
async function bulkDeleteMeetings() {
    if (selectedMeetings.size === 0) {
        showError('No meetings selected');
        return;
    }

    const count = selectedMeetings.size;
    const meetingIds = Array.from(selectedMeetings);

    showConfirmDialog(
        'Delete Multiple Meetings',
        `Are you sure you want to delete <strong>${count} meeting(s)</strong>? This action cannot be undone.`,
        'Delete All',
        'Cancel',
        async () => {
            try {
                const response = await fetch('/api/meetings/bulk-delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        meeting_ids: meetingIds
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    clearSelection();
                    await loadMeetings();
                    await loadClients();
                    showSuccess(result.message);
                } else {
                    const error = await response.json();
                    showError(error.detail || 'Failed to delete meetings');
                }
            } catch (error) {
                console.error('Error bulk deleting:', error);
                showError('Failed to delete meetings');
            }
        }
    );
}

// Enable bulk select mode on checkbox click anywhere
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcut for bulk select (Ctrl/Cmd + B)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
            e.preventDefault();
            toggleBulkSelectMode();
        }
    });
});

// ============================================
// CALENDAR VIEW FUNCTIONALITY
// ============================================

let currentCalendarDate = new Date();
let calendarMeetings = [];

// Open calendar view
function openCalendarView() {
    currentCalendarDate = new Date();
    calendarMeetings = allMeetings.filter(m => m.meeting_date || m.next_meeting);
    renderCalendar();
    document.getElementById('calendarModal').style.display = 'block';
}

// Close calendar view
function closeCalendarView() {
    document.getElementById('calendarModal').style.display = 'none';
}

// Navigate to previous month
function previousMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderCalendar();
}

// Navigate to next month
function nextMonth() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderCalendar();
}

// Go to today
function goToToday() {
    currentCalendarDate = new Date();
    renderCalendar();
}

// Render calendar
function renderCalendar() {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();

    // Update month/year display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('calendarMonthYear').textContent = `${monthNames[month]} ${year}`;

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Get previous month's last days
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';

    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        calendarGrid.appendChild(header);
    });

    // Add previous month's trailing days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dayElement = createCalendarDay(day, year, month - 1, true);
        calendarGrid.appendChild(dayElement);
    }

    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createCalendarDay(day, year, month, false);
        calendarGrid.appendChild(dayElement);
    }

    // Add next month's leading days
    const remainingCells = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createCalendarDay(day, year, month + 1, true);
        calendarGrid.appendChild(dayElement);
    }

    // Show meetings for current month
    showCalendarMeetingsForMonth(year, month);
}

// Create calendar day element
function createCalendarDay(day, year, month, isOtherMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';

    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }

    // Check if it's today
    const today = new Date();
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (dateString === todayString) {
        dayElement.classList.add('today');
    }

    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    // Find meetings for this date
    const meetingsOnDate = findMeetingsForDate(year, month, day);

    if (meetingsOnDate.length > 0) {
        // Show meeting count
        const countBadge = document.createElement('div');
        countBadge.className = 'calendar-meeting-count';
        countBadge.textContent = `${meetingsOnDate.length} meeting${meetingsOnDate.length > 1 ? 's' : ''}`;
        dayElement.appendChild(countBadge);

        // Show preview of first meeting
        if (meetingsOnDate[0]) {
            const preview = document.createElement('div');
            preview.className = 'calendar-meeting-preview';
            preview.textContent = meetingsOnDate[0].client;
            dayElement.appendChild(preview);
        }
    }

    // Click handler to show meetings
    dayElement.addEventListener('click', () => {
        showMeetingsForDate(year, month, day, meetingsOnDate);
    });

    return dayElement;
}

// Find meetings for a specific date
function findMeetingsForDate(year, month, day) {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return allMeetings.filter(meeting => {
        // Check meeting_date field
        if (meeting.meeting_date) {
            const meetingDate = meeting.meeting_date.split('T')[0];
            if (meetingDate === dateString) return true;
        }

        // Check next_meeting field for dates
        if (meeting.next_meeting) {
            const dateMatch = meeting.next_meeting.match(/([A-Za-z]{3}),\s+([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/i);
            if (dateMatch) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const parsedMonth = monthNames.indexOf(dateMatch[2]);
                const parsedDay = parseInt(dateMatch[3]);
                const parsedYear = parseInt(dateMatch[4]);

                if (parsedYear === year && parsedMonth === month && parsedDay === day) {
                    return true;
                }
            }
        }

        return false;
    });
}

// Show meetings for a specific date
function showMeetingsForDate(year, month, day, meetings) {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const dateString = `${monthNames[month]} ${day}, ${year}`;

    const meetingsList = document.getElementById('calendarMeetingsList');

    if (meetings.length === 0) {
        meetingsList.innerHTML = `
            <h3>Meetings on ${dateString}</h3>
            <div class="calendar-no-meetings">No meetings scheduled for this date</div>
        `;
        return;
    }

    meetingsList.innerHTML = `<h3>Meetings on ${dateString} (${meetings.length})</h3>`;

    meetings.forEach(meeting => {
        const meetingItem = document.createElement('div');
        meetingItem.className = 'calendar-meeting-item';
        meetingItem.onclick = () => {
            closeCalendarView();
            // Scroll to meeting in main view
            setTimeout(() => {
                const meetingCard = document.querySelector(`.meeting-card[data-meeting-id="${meeting.id}"]`);
                if (meetingCard) {
                    meetingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    meetingCard.style.boxShadow = '0 0 0 4px #6366F1';
                    setTimeout(() => {
                        meetingCard.style.boxShadow = '';
                    }, 2000);
                }
            }, 300);
        };

        meetingItem.innerHTML = `
            <h4>${meeting.client} - Update ${meeting.client_order}</h4>
            <p><strong>People:</strong> ${meeting.people_connected || 'N/A'}</p>
            ${meeting.actions ? `<p><strong>Actions:</strong> ${meeting.actions.substring(0, 100)}${meeting.actions.length > 100 ? '...' : ''}</p>` : ''}
            ${meeting.next_meeting ? `<p><strong>Next Meeting:</strong> ${meeting.next_meeting}</p>` : ''}
        `;

        meetingsList.appendChild(meetingItem);
    });
}

// Show meetings for current month
function showCalendarMeetingsForMonth(year, month) {
    const meetingsInMonth = [];

    for (let day = 1; day <= 31; day++) {
        const meetings = findMeetingsForDate(year, month, day);
        meetingsInMonth.push(...meetings);
    }

    // Remove duplicates
    const uniqueMeetings = Array.from(new Set(meetingsInMonth.map(m => m.id)))
        .map(id => meetingsInMonth.find(m => m.id === id));

    if (uniqueMeetings.length > 0) {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        showMeetingsForDate(year, month, 1, []);
        document.getElementById('calendarMeetingsList').innerHTML = `
            <h3>${monthNames[month]} ${year} - ${uniqueMeetings.length} Meeting${uniqueMeetings.length > 1 ? 's' : ''}</h3>
            <p style="color: #6B7280; font-size: 13px; margin-bottom: 16px;">Click on any day to see meetings scheduled</p>
        `;
    } else {
        document.getElementById('calendarMeetingsList').innerHTML = `
            <div class="calendar-no-meetings">No meetings scheduled this month</div>
        `;
    }
}

// ============================================
// EMAIL REMINDER FUNCTIONALITY
// ============================================

// Test email reminder
async function testEmailReminder() {
    const btn = document.getElementById('testEmailBtn');
    const originalText = btn.innerHTML;

    try {
        // Disable button and show loading state
        btn.disabled = true;
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
            </svg>
            Sending...
        `;

        const response = await fetch('/api/email/send-reminder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();

        if (result.success) {
            showSuccess(`Email sent! ${result.count} meeting(s) included in reminder.`);

            // Show which meetings were included
            if (result.meetings && result.meetings.length > 0) {
                const meetingsList = result.meetings.map(m =>
                    `• ${m.client}: ${m.next_meeting} (${m.days_left} day${m.days_left !== 1 ? 's' : ''})`
                ).join('\n');

                console.log('Meetings included in email:\n' + meetingsList);
            }
        } else {
            showError(result.message || 'No upcoming meetings to send');
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        showError('Failed to send email: ' + error.message);
    } finally {
        // Restore button
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Add CSS for spinning animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
