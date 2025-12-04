# Meeting Management Dashboard - Complete Design & Functionality Specification

## Visual Design Requirements

### Color Palette
- **Primary Brand Color**: Indigo/Purple (#6366F1 or similar)
- **Background**: Light gray (#F9FAFB)
- **Card Background**: White (#FFFFFF)
- **Text Primary**: Dark gray (#111827)
- **Text Secondary**: Medium gray (#6B7280)
- **Border Color**: Light gray (#E5E7EB)
- **Hover State**: Slightly darker primary color
- **Icons**: Gray (#9CA3AF)

### Typography
- **Page Title**: Large, bold, dark text
- **Subtitle**: Small, gray text
- **Section Headers (Client Names)**: Medium-large, bold, dark text
- **Update Count**: Small, light gray text
- **Update Title**: Medium, bold, primary color (indigo/purple)
- **Field Labels**: Small, uppercase, gray text with icons
- **Field Values**: Regular, dark text

### Layout Structure

#### Header Bar (Top)
- White background
- Contains:
  - **Left Side**:
    - Calendar icon in rounded square with primary color background
    - "Meeting Management" title (large, bold)
    - "Track and organize your client meetings" subtitle (small, gray)
  - **Right Side**:
    - "+ Add Meeting" button (primary color, white text)
    - "Import" button (white background, outlined)

#### Search & Filter Bar
- Below header
- White background
- Contains:
  - **Left Side**: Search input with magnifying glass icon
    - Placeholder: "Search in client, people, actions, address..."
    - Full width search bar
  - **Right Side**:
    - "Advanced" dropdown button with filter icon
    - "Excel" button with document icon
    - "PDF" button with document icon

#### Main Content Area
- Light gray background
- Vertically stacked client groups with spacing between them

### Client Group Card Design
Each client group is a white card with:
- **Rounded corners** (medium border radius)
- **Subtle shadow** (light drop shadow)
- **Header Section**:
  - Left: Calendar icon in rounded square with primary color background
  - Client name (bold, dark)
  - Update count below name (e.g., "2 updates" - small, light gray)
  - Right: Chevron up/down icon for collapse/expand
  - Padding around all elements
  - Hover effect on entire header (cursor pointer)

### Individual Meeting Card Design (Update Cards)
Within each client group, meeting cards are displayed with:

**Card Structure**:
- White background (same as parent card)
- Subtle top border or separator line
- Padding around content

**Update Header**:
- Left: Drag handle icon (six dots in grid pattern)
- "Update 1" / "Update 2" text (bold, primary color)
- Right: Edit icon button and Delete icon button

**Field Layout** (Grid with 3 columns):

**Column 1 - Left:**
1. **PEOPLE CONNECTED** (with person icon)
   - Names and roles listed below
   - Each name on separate line

2. **ADDRESS** (with location pin icon)
   - Address lines below

**Column 2 - Middle:**
1. **ACTIONS** (with clipboard/document icon)
   - Action items listed below

2. **ACTIONS TAKEN** (with checkmark/circle icon)
   - Completed actions listed below

**Column 3 - Right:**
1. **NEXT MEETING** (with calendar icon)
   - Meeting date and time below

**Field Styling**:
- Label: Small, uppercase, gray text (#6B7280)
- Icon: Small, gray, positioned before label
- Value: Regular size, dark text (#111827)
- Spacing between fields vertically
- Empty fields show "-" in light gray

### Button Styles

**Primary Button** (Add Meeting):
- Primary color background (#6366F1)
- White text
- Rounded corners
- Padding: medium
- Icon (+ symbol) before text
- Hover: slightly darker shade

**Secondary Button** (Import, Advanced, Excel, PDF):
- White background
- Gray border
- Dark text
- Rounded corners
- Icon before/after text
- Hover: light gray background

**Icon Buttons** (Edit, Delete):
- No background (transparent)
- Gray icon color
- Small size
- Hover: darker gray
- Positioned with spacing between them

### Interactive States

**Collapsible Groups**:
- Collapsed: Only header visible, chevron points right (→)
- Expanded: All updates visible, chevron points up (↑)
- Smooth transition animation

**Drag & Drop**:
- Dragging: Card opacity 50%, cursor grabbing
- Drag over: Show visual indicator (border highlight or shadow change)
- Can only drag within same client group

**Inline Editing**:
- Click on any field value to edit
- Field converts to textarea with border
- Save and Cancel buttons appear below
- Save button: Primary color
- Cancel button: Secondary gray

**Search Active**:
- Real-time filtering as user types
- Highlight matching text (optional)

## Complete Functionality Specification

### Core Data Structure
Each meeting entry contains:
- **Client** (required, text)
- **People Connected** (multi-line text)
- **Actions** (multi-line text)
- **Next Meeting** (multi-line text)
- **Address** (multi-line text)
- **Actions Taken** (multi-line text)
- **Update Number** (auto-generated sequential per client: Update 1, Update 2, etc.)

### Main Features

#### 1. Client Grouping
- Meetings grouped by client name
- Groups ordered chronologically by when client first appeared
- Each group shows:
  - Client name as header
  - Update count (e.g., "2 updates")
  - Collapse/expand control (chevron icon)
- All groups expanded by default

#### 2. Collapsible Client Groups
- Click entire client header to toggle collapse/expand
- Chevron icon changes: ↑ (expanded) / → or ↓ (collapsed)
- Smooth animation when collapsing/expanding
- State persists during session

#### 3. Drag & Drop Reordering
- Each update card is draggable (drag handle icon visible)
- Can only reorder within same client group
- Cannot drag between different clients
- Visual feedback during drag:
  - Dragged card: 50% opacity
  - Target drop area: highlight with border or shadow
- Order saves to database immediately
- API call: POST `/api/meetings/reorder` with `{dragged_id, target_id}`

#### 4. Inline Editing
- Click on any field value (People Connected, Actions, Next Meeting, Address, Actions Taken)
- Field converts to textarea
- Save and Cancel buttons appear below textarea
- Save: Updates via API, reloads data, shows success message
- Cancel: Reverts to original value
- API call: PUT `/api/meetings/{id}`

#### 5. Search Functionality
- Search bar with magnifying glass icon
- Placeholder: "Search in client, people, actions, address..."
- Real-time filtering as user types
- Searches across: client, people_connected, actions, next_meeting, address, actions_taken
- Case-insensitive
- Works in combination with status filters
- Clear button resets search

#### 6. Advanced Filters
- Collapsible panel triggered by "Advanced" button
- Status dropdown with options:
  - All (default)
  - Has Next Meeting
  - No Next Meeting
  - Actions Taken
  - No Actions Taken
- Filters combine with search query
- Active filters indicated visually

#### 7. Add Meeting
- Button in header: "+ Add Meeting"
- Opens modal with form:
  - **Client** (required, text input with autocomplete from existing clients)
  - **People Connected** (textarea)
  - **Actions** (textarea)
  - **Next Meeting** (textarea)
  - **Address** (textarea)
  - **Actions Taken** (textarea)
- Save button: POST to `/api/meetings`
- Cancel button: closes modal
- Success message after save

#### 8. Edit Meeting
- Edit icon button on each update card
- Opens same modal as Add Meeting
- Pre-filled with existing data
- Title: "Edit Meeting"
- Save button: PUT to `/api/meetings/{id}`
- Success message after save

#### 9. Delete Meeting
- Delete icon button on each update card
- Shows confirmation dialog: "Are you sure you want to delete this meeting for {client}?"
- If confirmed: DELETE to `/api/meetings/{id}`
- Success message after deletion

#### 10. Excel Import
- "Import" button in header
- Opens modal with:
  - File input (accepts .xlsx, .xls)
  - Help text: "Upload your existing Excel file to import all meetings"
  - Import button
- Uploads via FormData to `/api/import-excel`
- Expected columns: Client, People Connected, Actions, Next Meeting, Address, Actions Taken
- Success message shows count of imported meetings
- Reloads all data after import

#### 11. Excel Export
- "Excel" button in search bar area
- Exports currently filtered meetings (or all if no filters applied)
- POST to `/api/export/excel` with `{meeting_ids: [...]}`
- Downloads file: `meetings_export_YYYY-MM-DD.xlsx`
- Columns: Client, Update #, People Connected, Actions, Next Meeting, Address, Actions Taken
- Success message shows count of exported meetings

#### 12. PDF Export
- "PDF" button in search bar area
- Exports currently filtered meetings (or all if no filters applied)
- POST to `/api/export/pdf` with `{meeting_ids: [...]}`
- Downloads file: `meetings_report_YYYY-MM-DD.pdf`
- Grouped by client with clean layout
- Success message shows count of exported meetings

### API Endpoints

#### GET `/api/meetings`
Returns array of all meetings ordered by `client_first_appearance` and `global_order`

Response:
```json
[
  {
    "id": 1,
    "client": "Acme Corporation",
    "client_order": 1,
    "global_order": 1,
    "client_first_appearance": 1,
    "people_connected": "John Smith (CEO)\nSarah Johnson (CTO)",
    "actions": "Review Q4 projections\nDiscuss partnership opportunities",
    "next_meeting": "December 15, 2024 at 2:00 PM",
    "address": "123 Business Ave, Suite 500\nNew York, NY 10001",
    "actions_taken": "Sent follow-up email with proposal",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
]
```

#### GET `/api/meetings/{id}`
Returns single meeting object

#### POST `/api/meetings`
Creates new meeting

Request body:
```json
{
  "client": "string (required)",
  "people_connected": "string (optional)",
  "actions": "string (optional)",
  "next_meeting": "string (optional)",
  "address": "string (optional)",
  "actions_taken": "string (optional)"
}
```

Auto-generates: `client_order`, `global_order`, `client_first_appearance`

#### PUT `/api/meetings/{id}`
Updates existing meeting (same request body as POST)

#### DELETE `/api/meetings/{id}`
Deletes meeting

Response: `{"message": "Meeting deleted successfully"}`

#### GET `/api/clients`
Returns array of distinct client names for autocomplete

Response:
```json
[
  {"name": "Acme Corporation"},
  {"name": "TechStart Inc"}
]
```

#### POST `/api/meetings/reorder`
Reorders meetings within same client group

Request body:
```json
{
  "dragged_id": 1,
  "target_id": 2
}
```

Response: `{"message": "Reordered successfully"}`

#### POST `/api/import-excel`
Imports meetings from Excel file

Request: Multipart form data with file

Response: `{"message": "Successfully imported 35 meetings"}`

#### POST `/api/export/excel`
Exports meetings to Excel

Request body:
```json
{
  "meeting_ids": [1, 2, 3]
}
```

Response: Excel file as blob

#### POST `/api/export/pdf`
Exports meetings to PDF

Request body:
```json
{
  "meeting_ids": [1, 2, 3]
}
```

Response: PDF file as blob

### User Experience Details

#### Empty State
When no meetings found:
- Center-aligned message
- "No Meetings Found"
- "Start by adding your first meeting or import from Excel"
- Gray text color

#### Loading States
- Show loading spinner during API calls
- Disable buttons during operations

#### Success/Error Messages
Use toast notifications or alert dialogs:

**Success messages:**
- "Meeting added successfully"
- "Meeting updated successfully"
- "Meeting deleted successfully"
- "Updated successfully" (inline edit)
- "Order updated" (drag & drop)
- "Successfully imported X meetings"
- "Exported X meetings to Excel"
- "Exported X meetings to PDF"

**Error messages:**
- "Failed to load meetings"
- "Failed to save meeting"
- "Failed to delete meeting"
- "Failed to update"
- "Cannot move between different clients"
- "No meetings to export"
- "Failed to import Excel file"
- "Failed to export"

#### Modal Behavior
- Overlay darkens background (40-50% opacity)
- Modal centered on screen
- Close via:
  - X button in corner
  - Cancel button
  - Clicking outside modal (on overlay)
- Form resets when modal closes
- Smooth fade-in/fade-out animation

#### Data Refresh
Auto-reload meetings and clients after:
- Add meeting
- Edit meeting (including inline edit)
- Delete meeting
- Import Excel
- Reorder meetings

#### Client Autocomplete
- Input shows datalist dropdown
- Displays existing client names
- Allows typing new client names
- Filters suggestions as user types
- Select from list or type custom value

### Responsive Behavior
- Desktop: Full layout as shown
- Tablet: Adjust grid to 2 columns for fields
- Mobile: Stack fields vertically, single column

### Accessibility
- All buttons have aria-labels
- Keyboard navigation support
- Focus indicators visible
- Color contrast meets WCAG AA standards
- Icons have text alternatives

### Animation & Transitions
- Modal open/close: 200ms fade
- Collapse/expand: 300ms ease-in-out
- Drag & drop: Smooth position transitions
- Button hovers: 150ms ease
- All transitions smooth and subtle

## Implementation Notes

### Key Components to Create
1. **Header Component** - Logo, title, action buttons
2. **SearchBar Component** - Search input, filter buttons, export buttons
3. **AdvancedFilters Component** - Collapsible filter panel
4. **ClientGroup Component** - Collapsible client card with header
5. **MeetingCard Component** - Individual update card with fields
6. **MeetingModal Component** - Add/Edit form modal
7. **ImportModal Component** - File upload modal
8. **InlineEditField Component** - Editable field with save/cancel

### State Management
- `allMeetings`: Array of all meetings from API
- `filteredMeetings`: Array after applying search/filters
- `allClients`: Array of client names for autocomplete
- `searchQuery`: Current search text
- `statusFilter`: Selected status filter
- `isModalOpen`: Boolean for add/edit modal
- `isImportModalOpen`: Boolean for import modal
- `editingMeeting`: Meeting object being edited (null for add)
- `collapsedClients`: Set of collapsed client names

### Drag & Drop Implementation
- Use HTML5 Drag & Drop API or library like `react-beautiful-dnd`
- Store `draggedElement` in state
- Handle events: `onDragStart`, `onDragEnd`, `onDragOver`, `onDrop`
- Validate same client before allowing drop
- Call reorder API on successful drop

### File Upload
- Use FormData for Excel import
- Validate file type before upload
- Show progress indicator during upload
- Handle large files gracefully

### Export Downloads
- Fetch blob from API
- Create temporary anchor element
- Trigger download with filename
- Clean up object URL after download

### Icons to Use
- Calendar/Building icon for client groups
- Person/Users icon for People Connected
- Clipboard/Document icon for Actions
- Calendar icon for Next Meeting
- Location/Pin icon for Address
- Checkmark/Circle icon for Actions Taken
- Plus icon for Add button
- Upload/Folder icon for Import
- Document icon for Excel/PDF exports
- Pencil icon for Edit
- Trash icon for Delete
- Search/Magnifying glass for search
- Filter/Sliders icon for Advanced
- Chevron up/down for collapse
- Six dots grid for drag handle
- X icon for close

Use a library like **Lucide React**, **Heroicons**, or **React Icons** for consistent icon set.

## Final Checklist

✅ **Visual Design**
- Exact color scheme matching reference image
- Proper spacing and padding throughout
- Rounded corners on cards and buttons
- Subtle shadows on cards
- Icons properly sized and positioned
- Typography hierarchy matches reference

✅ **Layout**
- Header with logo, title, and buttons
- Search bar with filters and export buttons
- Client groups as collapsible cards
- Update cards with 3-column field grid
- Proper alignment and spacing

✅ **Functionality**
- Client grouping and ordering
- Collapse/expand groups
- Drag & drop reordering
- Inline editing
- Search across all fields
- Advanced status filters
- Add/Edit meeting modals
- Delete with confirmation
- Excel import
- Excel export
- PDF export

✅ **User Experience**
- Empty state message
- Loading indicators
- Success/error notifications
- Modal overlay and close behavior
- Client autocomplete
- Confirmation dialogs
- Data auto-refresh

✅ **Interactions**
- Smooth animations
- Hover effects
- Focus states
- Drag visual feedback
- Button disabled states
- Form validation

This specification provides everything needed to replicate the exact design and functionality in Lovable. Copy this entire specification into Lovable's prompt interface.
