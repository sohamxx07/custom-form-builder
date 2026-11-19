# Custom Form Builder

A modern, full-stack web application that allows creators to build custom, dynamic forms without writing code. Creators can manage forms, add and configure varied input fields, test form interactions in a live sandbox preview, and set up file upload restrictions.

---

## 🛠️ Tech Stack

### Backend
- **Node.js** & **Express.js** (REST API)
- **SQLite** with **Sequelize ORM**
- **JWT (`jsonwebtoken`)** for stateless authentication
- **Bcrypt** for secure password hashing
- **Multer** for handling multipart file upload validations
- **CommonJS** module system

### Frontend
- **React 18** (Vite)
- **Tailwind CSS** for UI styling
- **React Router DOM (v6)** for client-side routing
- **Axios** with centralized JWT auth interceptor
- **ES Modules**

---

## ✨ Features

- **Authentication & Security**:
  - Creator registration and login.
  - Password hashing via Sequelize model hooks (`beforeCreate`, `beforeUpdate`).
  - JWT Bearer token authentication protecting all creator endpoints.
- **Form Management**:
  - Full CRUD operations for forms (Title, Description).
  - Strict user-level isolation (creators can only access their own forms).
- **Field Builder**:
  - Add, edit, reorder (`sortOrder`), and delete fields.
  - Supports 8 input types:
    - Single-line Text
    - Email Address
    - Number
    - Multi-line Paragraph (Textarea)
    - Dropdown Select
    - Multiple Choice (Radio)
    - Checkboxes
    - File Upload
- **Advanced File Upload Configuration**:
  - Whitelist allowed file extensions (`PDF`, `JPG`, `PNG`, `DOC`, `XLS`, etc.).
  - Configurable maximum file size in MB.
  - Pre-compiled server-side MIME type verification.
- **Interactive Sandbox / Preview Mode**:
  - Live respondent-facing test preview.
  - All inputs are fully interactive (not disabled).
  - Drag-and-drop file upload with client & server-side validation.
  - Automatic test upload cleanup (zero disk bloat).
  - Complete form submission simulation without polluting the database.

---

## 📁 Project Structure

```
custom-form-builder/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize SQLite connection (db.js)
│   │   ├── controllers/     # Auth, Form, and Field controllers
│   │   ├── middleware/      # JWT authentication middleware
│   │   ├── models/          # User, Form, FormField Sequelize models
│   │   ├── routes/          # Express route definitions
│   │   └── utils/           # JWT token generator
│   ├── .env.example         # Environment template
│   ├── package.json
│   └── server.js            # Backend entry point
├── frontend/
│   ├── src/
│   │   ├── api/             # Centralized Axios instance with interceptors
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── context/         # AuthContext (login, register, logout, token)
│   │   ├── pages/           # Login, Register, Dashboard, FormEditor, FormBuilder, FormPreview
│   │   ├── App.jsx          # Route tree
│   │   └── main.jsx         # React DOM mount point
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── .gitignore
├── PROJECT_CONTEXT.md
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **Git**

---

### 1. Clone & Setup Repository

```bash
git clone <your-repository-url>
cd custom-form-builder
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the environment file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt, use `copy .env.example .env`)*

4. Configure `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   DB_STORAGE=./database.sqlite
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:3000`.*

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new creator account |
| `POST` | `/api/auth/login` | Log in and receive a JWT Bearer token |

### Forms (`/api/forms`) — *Protected*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/forms` | Create a new form |
| `GET` | `/api/forms` | Get all forms belonging to the logged-in user |
| `GET` | `/api/forms/:id` | Get specific form details |
| `PUT` | `/api/forms/:id` | Update form title or description |
| `DELETE` | `/api/forms/:id` | Delete a form |
| `POST` | `/api/forms/:id/test-submit` | Test validate complete form submission (Sandbox) |

### Form Fields (`/api/forms/:formId/fields`) — *Protected*
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/:formId/fields` | Add a new field to a form |
| `GET` | `/:formId/fields` | Get all fields belonging to a form |
| `PUT` | `/:formId/fields/:fieldId` | Update a field's configuration |
| `DELETE` | `/:formId/fields/:fieldId` | Delete a field |
| `POST` | `/:formId/fields/:fieldId/test-upload` | Validate test file upload (MIME, ext, size) |

---

## 📄 License
This project is open source and available under the [ISC License](LICENSE).
