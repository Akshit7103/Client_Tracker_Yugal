from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import Meeting, get_db, engine, Base
import pandas as pd
from datetime import datetime
from io import BytesIO
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

app = FastAPI(title="Meeting Dashboard")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Pydantic models
class MeetingBase(BaseModel):
    client: str
    people_connected: Optional[str] = None
    actions: Optional[str] = None
    next_meeting: Optional[str] = None
    address: Optional[str] = None
    actions_taken: Optional[str] = None

class MeetingCreate(MeetingBase):
    pass

class MeetingUpdate(MeetingBase):
    pass

class MeetingResponse(MeetingBase):
    id: int
    client_order: int
    global_order: int
    client_first_appearance: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Create tables
Base.metadata.create_all(bind=engine)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    return FileResponse("static/index.html")

@app.get("/api/meetings", response_model=List[MeetingResponse])
def get_meetings(
    client: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Meeting)
    if client:
        query = query.filter(Meeting.client.ilike(f"%{client}%"))

    # Order by client's first appearance (chronological), then by global_order within client
    meetings = query.order_by(Meeting.client_first_appearance, Meeting.global_order).all()
    return meetings

@app.get("/api/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting

@app.post("/api/meetings", response_model=MeetingResponse)
def create_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    # Get the highest client_order for this client
    max_order = db.query(Meeting).filter(
        Meeting.client == meeting.client
    ).order_by(Meeting.client_order.desc()).first()

    new_order = 1 if not max_order else max_order.client_order + 1

    # Get max global order
    max_global = db.query(Meeting).order_by(Meeting.global_order.desc()).first()
    new_global_order = 1 if not max_global else max_global.global_order + 1

    # Check if this client already exists
    existing_client = db.query(Meeting).filter(Meeting.client == meeting.client).first()
    if existing_client:
        client_first_appearance = existing_client.client_first_appearance
    else:
        # New client, use the current global order as first appearance
        client_first_appearance = new_global_order

    db_meeting = Meeting(
        **meeting.model_dump(),
        client_order=new_order,
        global_order=new_global_order,
        client_first_appearance=client_first_appearance
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@app.put("/api/meetings/{meeting_id}", response_model=MeetingResponse)
def update_meeting(meeting_id: int, meeting: MeetingUpdate, db: Session = Depends(get_db)):
    db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    old_client = db_meeting.client

    for key, value in meeting.model_dump().items():
        setattr(db_meeting, key, value)

    # If client changed, recalculate order and first appearance
    if old_client != meeting.client:
        max_order = db.query(Meeting).filter(
            Meeting.client == meeting.client
        ).order_by(Meeting.client_order.desc()).first()
        db_meeting.client_order = 1 if not max_order else max_order.client_order + 1

        # Check if this client already exists
        existing_client = db.query(Meeting).filter(
            Meeting.client == meeting.client,
            Meeting.id != meeting_id
        ).first()
        if existing_client:
            db_meeting.client_first_appearance = existing_client.client_first_appearance
        else:
            # New client, keep the current global order as first appearance
            db_meeting.client_first_appearance = db_meeting.global_order

    db_meeting.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_meeting)
    return db_meeting

@app.delete("/api/meetings/{meeting_id}")
def delete_meeting(meeting_id: int, db: Session = Depends(get_db)):
    db_meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not db_meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(db_meeting)
    db.commit()
    return {"message": "Meeting deleted successfully"}

@app.get("/api/clients")
def get_clients(db: Session = Depends(get_db)):
    clients = db.query(Meeting.client).distinct().all()
    return [{"name": client[0]} for client in clients if client[0]]

@app.post("/api/import-excel")
async def import_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        df = pd.read_excel(file.file)

        imported = 0
        client_first_seen = {}  # Track when each client first appears
        client_order_counter = {}  # Track order count for each client during import

        for index, row in df.iterrows():
            # Get max order for this client
            client_name = str(row.get('Client', '')).strip()
            if not client_name or client_name == 'nan':
                continue

            # Track chronological order (row index + 1 to start from 1)
            global_order = index + 1

            # Track when this client first appeared in the Excel
            if client_name not in client_first_seen:
                client_first_seen[client_name] = global_order

            # Track client order: check database for existing, then increment in memory
            if client_name not in client_order_counter:
                # First occurrence of this client in current import - check database
                max_order = db.query(Meeting).filter(
                    Meeting.client == client_name
                ).order_by(Meeting.client_order.desc()).first()
                client_order_counter[client_name] = 0 if not max_order else max_order.client_order

            # Increment order for this client
            client_order_counter[client_name] += 1
            new_order = client_order_counter[client_name]

            meeting = Meeting(
                client=client_name,
                people_connected=str(row.get('People Connected', '')) if pd.notna(row.get('People Connected')) else None,
                actions=str(row.get('Actions', '')) if pd.notna(row.get('Actions')) else None,
                next_meeting=str(row.get('Next Meeting', '')) if pd.notna(row.get('Next Meeting')) else None,
                address=str(row.get('Address', '')) if pd.notna(row.get('Address')) else None,
                actions_taken=str(row.get('Actions Taken', '')) if pd.notna(row.get('Actions Taken')) else None,
                client_order=new_order,
                global_order=global_order,
                client_first_appearance=client_first_seen[client_name]
            )
            db.add(meeting)
            imported += 1

        db.commit()
        return {"message": f"Successfully imported {imported} meetings"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error importing Excel: {str(e)}")

# Reorder meetings endpoint
class ReorderRequest(BaseModel):
    dragged_id: int
    target_id: int

@app.post("/api/meetings/reorder")
def reorder_meetings(request: ReorderRequest, db: Session = Depends(get_db)):
    try:
        dragged = db.query(Meeting).filter(Meeting.id == request.dragged_id).first()
        target = db.query(Meeting).filter(Meeting.id == request.target_id).first()

        if not dragged or not target:
            raise HTTPException(status_code=404, detail="Meeting not found")

        if dragged.client != target.client:
            raise HTTPException(status_code=400, detail="Cannot reorder across different clients")

        # Get all meetings for this client ordered by client_order
        client_meetings = db.query(Meeting).filter(
            Meeting.client == dragged.client
        ).order_by(Meeting.client_order).all()

        # Remove dragged from list
        client_meetings = [m for m in client_meetings if m.id != dragged.id]

        # Find target position
        target_index = next((i for i, m in enumerate(client_meetings) if m.id == target.id), 0)

        # Insert dragged at target position
        client_meetings.insert(target_index, dragged)

        # Update client_order for all
        for idx, meeting in enumerate(client_meetings):
            meeting.client_order = idx + 1

        db.commit()
        return {"message": "Reordered successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# Export to Excel endpoint
class ExportRequest(BaseModel):
    meeting_ids: List[int]

@app.post("/api/export/excel")
def export_to_excel(request: ExportRequest, db: Session = Depends(get_db)):
    try:
        # Check if meeting_ids is provided and not empty
        if not request.meeting_ids or len(request.meeting_ids) == 0:
            raise HTTPException(status_code=400, detail="No meetings to export")

        meetings = db.query(Meeting).filter(Meeting.id.in_(request.meeting_ids)).order_by(
            Meeting.client_first_appearance, Meeting.global_order
        ).all()

        if not meetings:
            raise HTTPException(status_code=404, detail="No meetings found")

        # Create DataFrame
        data = []
        for m in meetings:
            data.append({
                'Client': m.client,
                'Update #': m.client_order,
                'People Connected': m.people_connected or '',
                'Actions': m.actions or '',
                'Next Meeting': m.next_meeting or '',
                'Address': m.address or '',
                'Actions Taken': m.actions_taken or ''
            })

        df = pd.DataFrame(data)

        # Create Excel file in memory
        output = BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Meetings')

            # Get workbook and worksheet
            workbook = writer.book
            worksheet = writer.sheets['Meetings']

            # Add formatting
            header_format = workbook.add_format({
                'bold': True,
                'bg_color': '#667eea',
                'font_color': 'white',
                'border': 1
            })

            # Set column widths
            worksheet.set_column('A:A', 20)  # Client
            worksheet.set_column('B:B', 10)  # Update #
            worksheet.set_column('C:C', 30)  # People Connected
            worksheet.set_column('D:D', 40)  # Actions
            worksheet.set_column('E:E', 30)  # Next Meeting
            worksheet.set_column('F:F', 30)  # Address
            worksheet.set_column('G:G', 30)  # Actions Taken

            # Apply header format
            for col_num, value in enumerate(df.columns.values):
                worksheet.write(0, col_num, value, header_format)

        output.seek(0)

        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=meetings_export.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting: {str(e)}")

# Export to PDF endpoint
@app.post("/api/export/pdf")
def export_to_pdf(request: ExportRequest, db: Session = Depends(get_db)):
    try:
        # Check if meeting_ids is provided and not empty
        if not request.meeting_ids or len(request.meeting_ids) == 0:
            raise HTTPException(status_code=400, detail="No meetings to export")

        meetings = db.query(Meeting).filter(Meeting.id.in_(request.meeting_ids)).order_by(
            Meeting.client_first_appearance, Meeting.global_order
        ).all()

        if not meetings:
            raise HTTPException(status_code=404, detail="No meetings found")

        # Create PDF in memory
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=18)

        # Container for the 'Flowable' objects
        elements = []

        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=30,
            alignment=1  # Center
        )

        client_style = ParagraphStyle(
            'ClientHeader',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.white,
            backColor=colors.HexColor('#667eea'),
            spaceAfter=12,
            spaceBefore=12,
            leftIndent=10,
            rightIndent=10
        )

        # Add title
        elements.append(Paragraph("Meeting Management Report", title_style))
        elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles['Normal']))
        elements.append(Spacer(1, 20))

        # Group by client
        grouped = {}
        for m in meetings:
            if m.client not in grouped:
                grouped[m.client] = []
            grouped[m.client].append(m)

        # Add meetings by client
        for client, client_meetings in grouped.items():
            # Client header
            elements.append(Paragraph(f"<b>{client}</b> ({len(client_meetings)} updates)", client_style))
            elements.append(Spacer(1, 15))

            for idx, meeting in enumerate(client_meetings):
                # Meeting header with simple bold style
                meeting_title = ParagraphStyle(
                    'MeetingTitle',
                    parent=styles['Heading3'],
                    fontSize=11,
                    textColor=colors.HexColor('#333333'),
                    fontName='Helvetica-Bold',
                    spaceAfter=10
                )

                elements.append(Paragraph(f"Update {meeting.client_order}", meeting_title))

                # Clean paragraph style for content
                content_style = ParagraphStyle(
                    'ContentStyle',
                    parent=styles['Normal'],
                    fontSize=10,
                    leading=14,
                    spaceAfter=6
                )

                # Only show fields that have data
                if meeting.people_connected and meeting.people_connected != '-':
                    elements.append(Paragraph("<b>People Connected:</b>", content_style))
                    elements.append(Paragraph(meeting.people_connected, content_style))
                    elements.append(Spacer(1, 6))

                if meeting.actions and meeting.actions != '-':
                    elements.append(Paragraph("<b>Actions:</b>", content_style))
                    elements.append(Paragraph(meeting.actions, content_style))
                    elements.append(Spacer(1, 6))

                if meeting.next_meeting and meeting.next_meeting != '-':
                    elements.append(Paragraph("<b>Next Meeting:</b>", content_style))
                    elements.append(Paragraph(meeting.next_meeting, content_style))
                    elements.append(Spacer(1, 6))

                if meeting.address and meeting.address != '-':
                    elements.append(Paragraph("<b>Address:</b>", content_style))
                    elements.append(Paragraph(meeting.address, content_style))
                    elements.append(Spacer(1, 6))

                if meeting.actions_taken and meeting.actions_taken != '-':
                    elements.append(Paragraph("<b>Actions Taken:</b>", content_style))
                    elements.append(Paragraph(meeting.actions_taken, content_style))
                    elements.append(Spacer(1, 6))

                # Add separator between updates
                elements.append(Spacer(1, 12))
                if idx < len(client_meetings) - 1:  # Don't add line after last update
                    elements.append(Paragraph('<para borderWidth="0.5" borderColor="#cccccc" spaceBefore="0" spaceAfter="0">____________________________________________________________________</para>', styles['Normal']))
                    elements.append(Spacer(1, 12))

            # Page break after each client
            elements.append(PageBreak())

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=meetings_report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error exporting PDF: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
