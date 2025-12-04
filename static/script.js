let allMeetings = [];
let allClients = [];
let filteredMeetings = [];

// Load meetings on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMeetings();
    loadClients();
});

// Load all meetings from API
async function loadMeetings() {
    try {
        const response = await fetch('/api/meetings');
        allMeetings = await response.json();
        filteredMeetings = allMeetings;
        applyFilters();
    } catch (error) {
        console.error('Error loading meetings:', error);
        showError('Failed to load meetings');
    }
}

// Load all clients for autocomplete
async function loadClients() {
    try {
        const response = await fetch('/api/clients');
        allClients = await response.json();
        updateClientDatalist();
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Update client datalist for autocomplete
function updateClientDatalist() {
    const datalist = document.getElementById('clientList');
    datalist.innerHTML = allClients.map(client =>
        `<option value="${client.name}">`
    ).join('');
}

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

    // Generate HTML for each client group with collapse functionality
    container.innerHTML = Object.entries(groupedMeetings).map(([client, clientMeetings]) => `
        <div class="client-group" data-client="${client}">
            <div class="client-header" onclick="toggleClientGroup('${client}')">
                <div>
                    <div class="client-icon">📊</div>
                    <div class="client-info">
                        <div class="client-name">${client}</div>
                        <div class="meeting-count">${clientMeetings.length} update${clientMeetings.length > 1 ? 's' : ''}</div>
                    </div>
                </div>
                <span class="collapse-icon" id="collapse-${client}">▲</span>
            </div>
            <div class="client-meetings" id="meetings-${client}">
                ${clientMeetings.map(meeting => createMeetingCard(meeting)).join('')}
            </div>
        </div>
    `).join('');

    // Initialize drag and drop
    initializeDragAndDrop();
}

// Toggle client group collapse
function toggleClientGroup(client) {
    const meetingsDiv = document.getElementById(`meetings-${client}`);
    const icon = document.getElementById(`collapse-${client}`);

    if (meetingsDiv.classList.contains('collapsed')) {
        meetingsDiv.classList.remove('collapsed');
        icon.textContent = '▲';
    } else {
        meetingsDiv.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

// Create HTML for a single meeting card with drag-drop attributes
function createMeetingCard(meeting) {
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
                </div>
                <div class="meeting-actions">
                    <button class="btn btn-edit" onclick="event.stopPropagation(); editMeeting(${meeting.id})">✏️</button>
                    <button class="btn btn-danger" onclick="event.stopPropagation(); deleteMeeting(${meeting.id}, '${meeting.client}')">🗑️</button>
                </div>
            </div>
            <div class="meeting-details">
                ${createDetailItem('people_connected', 'People Connected', meeting.people_connected, meeting.id)}
                ${createDetailItem('actions', 'Actions', meeting.actions, meeting.id)}
                ${createDetailItem('next_meeting', 'Next Meeting', meeting.next_meeting, meeting.id)}
                ${createDetailItem('address', 'Address', meeting.address, meeting.id)}
                ${createDetailItem('actions_taken', 'Actions Taken', meeting.actions_taken, meeting.id)}
            </div>
        </div>
    `;
}

// Create detail item with inline editing
function createDetailItem(field, label, value, meetingId) {
    const displayValue = value || '-';
    return `
        <div class="detail-item">
            <label>${label}</label>
            <p onclick="enableInlineEdit(this, ${meetingId}, '${field}')" data-field="${field}">${displayValue}</p>
        </div>
    `;
}

// Enable inline editing
function enableInlineEdit(element, meetingId, field) {
    const currentValue = element.textContent === '-' ? '' : element.textContent;
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

// Save inline edit
async function saveInlineEdit(meetingId, field, button) {
    const container = button.parentNode.parentNode;
    const textarea = container.querySelector('textarea');
    const newValue = textarea.value.trim();

    try {
        // Get current meeting data
        const response = await fetch(`/api/meetings/${meetingId}`);
        const meeting = await response.json();

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
        document.getElementById('address').value = meeting.address || '';
        document.getElementById('actionsTaken').value = meeting.actions_taken || '';

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
    const meetingData = {
        client: document.getElementById('client').value,
        people_connected: document.getElementById('peopleConnected').value,
        actions: document.getElementById('actions').value,
        next_meeting: document.getElementById('nextMeeting').value,
        address: document.getElementById('address').value,
        actions_taken: document.getElementById('actionsTaken').value
    };

    try {
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

// Delete meeting
async function deleteMeeting(id, clientName) {
    if (!confirm(`Are you sure you want to delete this meeting for ${clientName}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/meetings/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
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

// Close modal
function closeModal() {
    document.getElementById('meetingModal').style.display = 'none';
}

// Open import modal
function openImportModal() {
    document.getElementById('importModal').style.display = 'block';
}

// Close import modal
function closeImportModal() {
    document.getElementById('importModal').style.display = 'none';
    document.getElementById('importForm').reset();
}

// Import Excel file
async function importExcel(event) {
    event.preventDefault();

    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        showError('Please select a file');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/import-excel', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const result = await response.json();
            closeImportModal();
            loadMeetings();
            loadClients();
            showSuccess(result.message);
        } else {
            const error = await response.json();
            showError(error.detail || 'Failed to import Excel file');
        }
    } catch (error) {
        console.error('Error importing Excel:', error);
        showError('Failed to import Excel file');
    }
}

// Show success message
function showSuccess(message) {
    alert('✅ ' + message);
}

// Show error message
function showError(message) {
    alert('❌ ' + message);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const meetingModal = document.getElementById('meetingModal');
    const importModal = document.getElementById('importModal');

    if (event.target === meetingModal) {
        closeModal();
    }
    if (event.target === importModal) {
        closeImportModal();
    }
}
