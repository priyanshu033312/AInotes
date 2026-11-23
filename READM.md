# NoteWise AI – Smart Study Assistant

An AI-powered learning platform that transforms lengthy academic notes, PDF documents, and PowerPoint presentations into short, easy-to-understand study material.

The platform uses AI to simplify difficult concepts, generate structured notes, create visual explanations, and produce downloadable PowerPoint presentations to make learning faster and more effective.

---

## 1. Project Overview

NoteWise AI is designed for students who struggle to understand lengthy textbooks, lecture notes, and complex academic presentations.

Users can upload their study material in PDF or PPT/PPTX format. The application processes the uploaded document and generates:

1. **Short Notes:** Concise notes containing the most important information.
2. **Easy Explanations:** Difficult concepts rewritten in simple, student-friendly language.
3. **Visual Learning:** Illustrations, flowcharts, block diagrams, and concept maps explaining complex topics.
4. **AI-Generated PPT:** A well-organized PowerPoint presentation containing simplified explanations and relevant visuals.
5. **Important Questions:** Key concepts and potential examination questions.
6. **Quick Revision:** A final revision sheet containing formulas, definitions, and important points.

The primary objective is to convert information-heavy documents into visually appealing and understandable learning material.

---

## 2. Core Features

### A. Document Upload

- Support PDF, PPT, and PPTX files.
- Drag-and-drop upload interface.
- Display uploaded filename, file size, and processing status.
- Allow users to remove and replace uploaded documents.
- Validate file formats and sizes.
- Display an upload progress indicator.

### B. AI-Powered Short Notes

After processing the uploaded document, generate:

- Chapter-wise summaries.
- Important definitions.
- Key concepts.
- Important formulas.
- Simplified explanations.
- Bullet-point notes.
- Real-world examples wherever relevant.

The notes should preserve the original technical meaning while making the content easier to understand.

Avoid unnecessarily long paragraphs.

### C. Difficult Concept Explanation

Identify concepts that require additional explanation.

For each difficult concept, provide:

- Original concept name.
- Simple explanation.
- Step-by-step breakdown.
- Practical example.
- Analogy to understand the concept.
- Relevant illustration or diagram.

For engineering subjects, preserve mathematical equations, symbols, units, and technical terminology.

### D. Visual Learning and Illustrations

This is one of the most important features.

Generate relevant visual explanations for difficult topics.

Supported visual formats:

- Flowcharts.
- Block diagrams.
- Process diagrams.
- Mind maps.
- Concept maps.
- Labeled technical illustrations.
- Step-by-step working diagrams.
- Comparison diagrams.

Visuals must explain the actual concept rather than being random decorative images.

Whenever possible, use generated diagrams with accurate labels and connections.

### E. Automatic PowerPoint Generation

Generate a downloadable PPTX presentation based on the uploaded document.

The presentation should include:

1. Title slide.
2. Introduction.
3. Main concepts.
4. Simplified explanations.
5. Important diagrams and illustrations.
6. Step-by-step explanations of difficult topics.
7. Important formulas and definitions.
8. Summary slide.
9. Quick revision slide.

PPT design requirements:

- Modern and professional design.
- Consistent typography.
- Appropriate colors.
- Minimal text per slide.
- Relevant illustrations.
- Clear diagrams.
- Proper spacing and alignment.

Allow users to download the generated PPTX file.

### F. Quick Revision Mode

Create a separate revision section containing:

- Important definitions.
- Key formulas.
- Important points.
- Differences between similar concepts.
- Short question-answer format.
- Important examination topics.

### G. Interactive Study Experience

Allow users to:

- Switch between original document and generated notes.
- Expand and collapse topics.
- Regenerate explanations.
- Download notes as PDF.
- Download presentations as PPTX.
- Copy individual explanations.
- Navigate between chapters.

---

## 3. Technology Stack

Use the following technologies.

### Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Lucide React for icons
- shadcn/ui for UI components

### Backend

Use Next.js API routes or a separate Python FastAPI backend.

Recommended approach: Next.js frontend with FastAPI for document processing and AI workflows.

### AI Integration

Use an LLM API through a configurable provider interface.

The AI should handle:

- Document summarization.
- Concept simplification.
- Topic extraction.
- Question generation.
- Structured note generation.
- Slide content generation.

Keep API keys in environment variables. Never expose them in frontend code.

### Document Processing

PDF:
- PyMuPDF or pdfplumber for extracting text.
- OCR support for scanned documents.

PPT/PPTX:
- python-pptx for extracting slide text.
- Extract slide titles, paragraphs, and available notes where supported.

### PowerPoint Generation

- python-pptx for generating downloadable presentations.
- Matplotlib or SVG-based diagrams for technical illustrations.
- Mermaid or other diagram-rendering tools for flowcharts.

### Database and Storage

For the initial version:
- Local temporary storage for uploaded documents.
- SQLite or PostgreSQL for user and document metadata.

For production:
- PostgreSQL.
- Cloud object storage for documents and generated files.

---

## 4. Website Design and UI/UX

The UI should feel like a premium modern AI SaaS application.

Avoid making it look like a basic college project or a generic file-upload website.

### Design Direction

Theme: Modern, minimal, premium educational AI platform.

Suggested color palette:

- Primary background: #0B0D17
- Secondary background: #121629
- Primary accent: #8B5CF6
- Secondary accent: #38BDF8
- Highlight: #A78BFA
- Main text: #F8FAFC
- Secondary text: #94A3B8

Use subtle gradients, glass-like cards, smooth transitions, rounded corners, and clean typography.

Support responsive desktop, tablet, and mobile layouts.

### Page 1: Landing Page

Create an attractive landing page with:

- NoteWise AI logo.
- Navigation bar.
- Hero section.
- Strong headline: "Turn Complex Notes Into Simple Learning."
- Supporting description.
- Get Started button.
- Upload document button.
- Animated document-to-notes illustration.
- Feature showcase.
- How it works section.
- Example generated notes.
- Footer.

The hero section should immediately communicate the main purpose of the product.

### Page 2: Dashboard

Create a modern dashboard containing:

- Welcome section.
- Upload document card.
- Recent documents.
- Previously generated notes.
- Recent presentations.
- Quick access to revision material.

Include a clean sidebar with:

- Dashboard
- My Documents
- My Notes
- Presentations
- Revision
- Settings

### Page 3: Document Upload

Create a visually attractive upload interface.

Features:

- Large drag-and-drop area.
- Browse files button.
- PDF and PPT/PPTX format indicators.
- Maximum file-size information.
- Uploaded document preview.
- Processing button.

After upload, display processing steps:

1. Uploading document.
2. Extracting content.
3. Identifying important topics.
4. Simplifying difficult concepts.
5. Generating visual explanations.
6. Preparing study material.

Show actual processing status rather than fake loading animations.

### Page 4: AI Study Workspace

This is the main application interface.

Use a three-section layout:

**Left sidebar:**
- Document outline.
- Chapter navigation.
- Topic navigation.

**Main content:**
- Short notes.
- Simplified explanations.
- Important definitions.
- Equations and formulas.
- Illustrations and diagrams.

**Right sidebar:**
- Ask AI about this document.
- Difficult concepts.
- Quick revision.
- Important questions.

Include a toggle between:
- Original Content
- Simplified Notes
- Visual Explanation

### Page 5: Presentation Generator

Create a dedicated presentation workspace.

Features:

- PPT preview.
- Slide thumbnails.
- Slide navigation.
- Presentation theme selection.
- Regenerate slide option.
- Download PPTX button.

Allow users to choose between:

- Minimal academic.
- Modern professional.
- Colorful educational.
- Engineering technical.

---

## 5. AI Processing Workflow

Implement the following workflow:

### Step 1: Upload

Accept PDF, PPT, and PPTX documents.

### Step 2: Extract

Extract text, headings, tables, equations, and slide content where possible.

Preserve page and slide references.

### Step 3: Organize

Identify:

- Chapters.
- Sections.
- Subtopics.
- Definitions.
- Formulas.
- Difficult concepts.
- Important examples.

### Step 4: Simplify

Send the extracted content to the AI model.

Ask the model to generate structured learning material.

The AI must:
- Preserve factual accuracy.
- Avoid inventing information.
- Maintain technical accuracy.
- Explain concepts in simple language.
- Retain important equations and units.
- Identify information that is unclear or missing.

### Step 5: Illustrate

Identify topics that would benefit from visual explanations.

Generate appropriate diagrams and illustrations.

For example:

If the uploaded document contains a topic about a heat exchanger, generate:
- Working principle.
- Heat flow diagram.
- Hot and cold fluid paths.
- Step-by-step explanation.

### Step 6: Generate PPT

Convert the structured notes and visual explanations into presentation slides.

### Step 7: Export

Allow downloading:
- Short notes as PDF.
- Presentation as PPTX.
- Revision sheet as PDF.

---

## 6. Important AI Instructions

Use a structured AI prompt.

The AI should behave like an experienced teacher who explains difficult academic concepts to undergraduate students.

Follow these rules:

1. Do not simply shorten the original text.
2. Explain difficult concepts in easy language.
3. Break complicated explanations into smaller steps.
4. Use examples and analogies wherever appropriate.
5. Include diagrams when they improve understanding.
6. Preserve all important technical information.
7. Never fabricate formulas, values, or technical facts.
8. Clearly distinguish source information from additional explanatory information.
9. Maintain the original chapter and topic structure.
10. Make the generated notes useful for examination preparation.

---

## 7. Suggested Project Structure

```text
notewise-ai/
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── upload/
│   │   ├── workspace/
│   │   └── presentations/
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── UploadZone.tsx
│   │   ├── NotesViewer.tsx
│   │   ├── DiagramViewer.tsx
│   │   └── PPTPreview.tsx
│   │
│   ├── lib/
│   └── public/
│
├── backend/
│   ├── main.py
│   ├── routes/
│   ├── services/
│   │   ├── pdf_processor.py
│   │   ├── ppt_processor.py
│   │   ├── ai_service.py
│   │   ├── diagram_generator.py
│   │   └── ppt_generator.py
│   │
│   ├── models/
│   └── requirements.txt
│
├── storage/
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 8. Security and Reliability

- Validate uploaded file types and sizes.
- Never execute uploaded files.
- Protect API keys.
- Use temporary file storage.
- Delete temporary files after processing or expiration.
- Add error handling for corrupted documents.
- Handle scanned PDFs using OCR.
- Avoid losing information during text extraction.
- Provide meaningful error messages.
- Never display one user's documents to another user.
- Do not claim successful processing when a backend operation fails.

---

## 9. Development Roadmap

Build the application in the following phases.

### Phase 1: UI Development
- Landing page.
- Dashboard.
- Upload page.
- Study workspace.
- Presentation preview.
- Responsive design.

### Phase 2: Document Processing
- PDF upload and extraction.
- PPT/PPTX upload and extraction.
- Document validation.
- Chapter and topic detection.

### Phase 3: AI Integration
- AI summarization.
- Simple explanations.
- Difficult concept identification.
- Formula and definition extraction.
- Important questions.

### Phase 4: Visual Learning
- Diagram generation.
- Flowcharts.
- Concept maps.
- Technical illustrations.

### Phase 5: PPT Generation
- Slide content generation.
- Professional slide templates.
- Diagram integration.
- PPTX export.

### Phase 6: Final Improvements
- PDF export.
- Error handling.
- Loading states.
- Performance optimization.
- Responsive testing.

---

## 10. Instructions for OpenCode

You are an expert full-stack developer, UI/UX designer, and AI application engineer.

Build NoteWise AI according to this README.

Important development instructions:

1. First inspect the existing project folder before making changes.
2. Understand the existing configuration and preserve working code.
3. Build the application using clean, modular, maintainable code.
4. Prioritize excellent UI/UX and a premium visual appearance.
5. Do not create a generic template-style website.
6. Use realistic content and meaningful sample documents in the dashboard.
7. Implement actual document upload and processing functionality.
8. Connect the AI model through a secure backend.
9. Implement real PPTX generation and downloadable files.
10. Never use fake buttons or non-functional UI elements.
11. Add proper loading, success, and error states.
12. Test every major feature before considering it complete.

### Important Instructions

Do not attempt to build every feature in one step.

Work phase by phase.

First complete the frontend and its responsive design. Then implement document processing, AI integration, diagram generation, and PowerPoint generation.

After each phase:
- Check for errors.
- Test the functionality.
- Fix problems before proceeding.
- Keep the project runnable.

If an API key is unavailable, build the integration interface and clearly explain how to configure it. Do not pretend that AI functionality is working without an actual model connection.

The final result should be a polished, functional AI-powered educational platform rather than just a static UI prototype.

---

## Final Goal

Create a platform where a student can upload a lengthy academic PDF or PowerPoint and receive:

- Easy-to-understand short notes.
- Detailed explanations of difficult topics.
- Relevant diagrams and illustrations.
- Important formulas and definitions.
- Examination-oriented revision material.
- A professionally designed downloadable PowerPoint presentation.

**Product tagline: Learn Less Complicated. Understand More.**