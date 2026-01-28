# AI Smart Pantry & Meal Planner

A smart kitchen assistant that tracks your pantry via AI vision and generates high-protein meal plans based on what you actually have.

## System Architecture

- **Frontend**: React (Vite) + TypeScript (Located in `frontend/`)
- **Styling**: Vanilla CSS
- **Backend / Database**: Firebase (Auth, Firestore, Storage)
- **AI Layer**:
  - **Primary**: Google Gemini API (Multimodal/Vision for OCR & Recipe Generation)
  - **Backup**: Llama 3 API (Text generation fallback)

## Development Phases

### Phase 1: Foundation & Identity
**Goal**: Secure, scalable base application.
- Initialize React + Vite project.
- Configure Firebase project (Web SDK).
- Implement Authentication (Login/Signup/Logout).
- Setup basic routing and "Premium" UI skeletal structure.

### Phase 2: The Digital Pantry
**Goal**: Manage what's in the kitchen.
- Design database schema (Firestore `pantryItems` collection).
- Implement Manual Entry (Add Item, Quantity, Expiry).
- Build the Pantry Dashboard (List view, Edit/Delete functionality).
- Connect Firebase Storage for item metadata/images.

### Phase 3: AI Vision & Integration
**Goal**: Automate input via camera.
- **Feature**: "Quick Add" via Camera/Image Upload.
- **Integration**: Send images to **Gemini Vision API**.
- **Logic**: OCR/Object detection to extract grocery list text -> Auto-append to Pantry database.
- Implement **Llama 3** connector as a fallback text processor.

### Phase 4: Nutrition Engine & Recipes
**Goal**: Intelligent utilization of inventory.
- **Feature**: "What can I cook?" Generator.
- **Constraint Logic**: Filter recipes to target **60g avg protein/day**.
- **Prompt Engineering**: Dynamic prompts using current pantry list to generate step-by-step recipes.
- Final UI Polish: Recipe cards, nutritional breakdown visuals.
