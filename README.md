# CreateMealPlan (My Pantry)

An AI-powered smart kitchen assistant that helps you reduce food waste and hit your protein goals. Snap a photo of your grocery receipt, and our AI automatically updates your pantry and generates personalized meal plans.

---

## 🚀 Key Features

*   **🤖 AI Receipt Scanner**: Uses **Google Gemini 1.5 Flash** to scan receipts via camera or upload, automatically extracting ingredients and quantities.
*   **🥗 Smart Pantry Management**: Track what you have in real-time (Firestore integration).
*   **🍳 AI Chef**: Generate high-protein recipes based strictly on the ingredients you currently have.
*   **🎨 Premium UI**: A sleek, dark-mode glassmorphism interface built with Vanilla CSS (no Tailwind dependency).
*   **🔐 Secure Authentication**: Full user management via Firebase Authentication (Google & Email/Password).

---

## 🛠 Tech Stack

### Frontend
*   **Framework**: React 18 + TypeScript + Vite
*   **Styling**: Custom CSS Variables, Glassmorphism Design
*   **State/Auth**: Firebase Web SDK, React Context API
*   **Routing**: React Router DOM (v6)

### Backend
*   **Runtime**: Node.js + Express
*   **Database**: Firebase Firestore (Admin SDK)
*   **AI Integration**: Google Generative AI (Gemini 1.5 Flash)
*   **Image Processing**: Multer (Upload handling)

---

## 🏗 Setup & Installation

### Prerequisites
*   Node.js (v18+)
*   Firebase Project (with Auth and Firestore enabled)
*   Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/BNMBois/CreateMealPlan.git
cd CreateMealPlan
```

### 2. Backend Setup
The backend handles the AI processing and secure database operations.

```bash
cd backend
npm install
```

**Configuration**:
1.  Create a `.env` file in `backend/`:
    ```env
    PORT=5000
    GEMINI_API_KEY=your_google_gemini_api_key
    ```
2.  Add your Firebase Service Account:
    *   Download your service account JSON from Firebase Console > Project Settings > Service Accounts.
    *   Save it as `src/config/serviceAccountKey.json`.

**Start Server**:
```bash
npm run dev
# Server running on http://localhost:5000
```

### 3. Frontend Setup
The frontend provides the user interface.

```bash
cd frontend
npm install
```

**Configuration**:
1.  Ensure `src/firebase.ts` is configured with your Firebase Web Config (API Key, Auth Domain, etc.).

**Start Application**:
```bash
npm run dev
# App running on http://localhost:5173
```

---

## 📂 Project Structure

```
CreateMealPlan/
├── backend/                 # Express Server & AI Logic
│   ├── src/
│   │   ├── config/          # Firebase & API Config
│   │   ├── controllers/     # Route Controllers
│   │   ├── routes/          # API Routes (Scanner, etc.)
│   │   └── index.ts         # Entry Point
│   └── serviceAccountKey.json # (Ignored by Git)
│
├── frontend/                # React Application
│   ├── src/
│   │   ├── components/      # Reusable UI Components
│   │   ├── context/         # AuthContext
│   │   ├── pages/           # Landing, Login, Profile, Scanner
│   │   └── index.css        # Global Styles
│   └── vite.config.ts       # Proxy Config
│
└── README.md                # Documentation
```

## 🛡 License
This project is for educational purposes.
