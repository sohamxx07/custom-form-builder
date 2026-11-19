# Custom Form Builder --- Project Context

> **Purpose of this file:** Give the AI coding assistant a concise,
> stable understanding of this project so it does not need to repeatedly
> inspect the entire repository for every task.
>
> **Working rule:** Read this file first. Then inspect only the files
> directly relevant to the current task. Do not scan the whole
> repository unless the task genuinely requires it.

------------------------------------------------------------------------

## 1. Project overview

**Project name:** Custom Form Builder

**Main goal:** Build a web application where a registered creator can
create custom forms without writing code, publish each form, share its
unique URL, collect submissions from respondents, and view the collected
responses in their dashboard.

### Main user roles

1.  **Form creator**
    -   Registers and logs in.
    -   Creates, edits, previews, publishes, and manages forms.
    -   Shares a published form URL.
    -   Views submissions received for their forms.
    -   May export responses if this feature is included in the agreed
        requirements.
2.  **Respondent**
    -   Opens a shared public form URL.
    -   Fills in the fields and submits the form.
    -   Does not need an account by default, unless the product
        requirements say otherwise.

### Main application flow

1.  Creator registers or logs in.
2.  Creator opens the dashboard and creates a form.
3.  Creator enters the form title and description.
4.  Creator adds fields and configures each field (for example: label,
    type, placeholder, required, and options where relevant).
5.  Creator saves and publishes the form.
6.  The application provides a unique public URL for that form.
7.  Respondents open the URL and see the form generated from its saved
    configuration.
8.  Respondents submit their answers.
9.  The backend stores each submission and associates it with the
    correct form.
10. The creator opens the dashboard, selects a form, and views its
    submissions.

**Important distinction:** - A **Form** record stores the form
definition/configuration (what questions and fields exist). - A **Form
Response** record stores the answers submitted by one respondent. - Each
response must be linked to the form it belongs to. Each form must be
linked to its creator.

------------------------------------------------------------------------

## 2. Technology stack

### Backend

-   Node.js
-   Express.js
-   SQLite
-   Sequelize ORM
-   CommonJS (`require` / `module.exports`)

### Frontend

-   React
-   Vite
-   Tailwind CSS

### Development tools

-   Google Antigravity
-   Postman for API testing

Do not replace this stack with MongoDB, Mongoose, TypeScript, or ES
modules unless the project owner explicitly changes the requirement.

------------------------------------------------------------------------

## 3. Current repository layout

The project root folder is:

``` text
custom-form-builder/
├── backend/
└── frontend/
```

### Backend `src` structure

``` text
backend/
└── src/
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── index.js
    │   ├── User.js
    │   ├── Form.js
    │   └── FormResponse.js
    ├── controllers/
    │   ├── authController.js
    │   ├── formController.js
    │   └── responseController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── formRoutes.js
    │   └── responseRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    ├── utils/
    │   └── generateToken.js
    └── app.js
```

The backend root also contains the server entry point, package files,
environment files, and SQLite database directory/file as appropriate.

This is the planned structure. Check the actual repository before
creating files; do not duplicate or overwrite existing files.

------------------------------------------------------------------------

## 4. Core data concepts

The initial data model is expected to contain these entities:

### User

Stores the creator's account information, such as name, email, and
securely hashed password.

### Form

Stores: - Creator/user reference - Form title - Form description - Field
configuration - Publication/status information if required - A unique
public identifier or slug used to resolve the shareable URL

The field configuration is structured data. It describes fields; it is
not a saved HTML page.

A field configuration may contain properties such as: - `label` -
`type` - `name` or stable field identifier - `placeholder` -
`required` - `options` for choice-based fields

Confirm the final field types and exact schema against the task
requirements before implementing them.

### FormResponse

Stores: - The form reference - Submitted answers - Submission
timestamp - Respondent information only if required by the product

Never store passwords as plain text. If a form is intended to register
application accounts, password handling must be designed securely and
separately from ordinary form-response storage.

### Relationships

-   One User can create many Forms.
-   One Form belongs to one User.
-   One Form can have many FormResponses.
-   Each FormResponse belongs to one Form.

Use Sequelize associations and foreign keys consistently. Decide
deletion behavior deliberately; do not cascade-delete user data without
a requirement.

------------------------------------------------------------------------

## 5. Main feature areas

1.  **Authentication:** creator registration, login, protected creator
    routes.
2.  **Form management:** create, list, fetch, update, delete, preview,
    and publish forms as required.
3.  **Dynamic form rendering:** render the public form using its saved
    field configuration.
4.  **Form sharing:** provide a stable unique public URL for a published
    form.
5.  **Response collection:** validate and save submissions against the
    correct form.
6.  **Response management:** allow the owning creator to view responses
    for their forms.
7.  **Optional features:** CSV/Excel export, email notifications,
    drag-and-drop ordering, analytics, pagination, and sorting. Do not
    implement optional features unless requested.

------------------------------------------------------------------------

## 6. Backend coding conventions

Follow these conventions:

-   Use CommonJS: `const x = require("...")` and `module.exports = ...`.
-   Use `async/await` for asynchronous operations.
-   Keep routes, controllers, models, middleware, configuration, and
    utilities separated.
-   Keep controller functions focused on request handling and business
    logic.
-   Use Sequelize for all database operations.
-   Keep database connection configuration in `src/config/db.js`.
-   Keep model definitions in `src/models/`.
-   Put model association setup in the model index/association setup
    rather than scattering it across controllers.
-   Use clear variable and function names.
-   Handle errors with `try/catch` where appropriate.
-   Return consistent JSON responses with suitable HTTP status codes.
-   Never expose password hashes or secrets in API responses.
-   Read secrets and environment-specific values from `.env`; never
    hardcode them.
-   Do not add packages or architectural layers without a reason.

### Response pattern

Use a consistent response shape, for example:

``` js
{
  data: result,
  message: "Operation completed successfully"
}
```

Use appropriate HTTP statuses (for example, 200 for successful
reads/updates, 201 for successful creation, 400 for invalid input, 401
for unauthenticated access, 403 for forbidden access, 404 for missing
resources, and 500 for unexpected server errors).

------------------------------------------------------------------------

## 7. Frontend conventions

-   Use React function components and hooks.
-   Use Tailwind CSS utility classes directly in JSX.
-   Use Axios for API communication if that is the chosen project
    dependency.
-   Keep pages, reusable components, services, routes, and shared state
    organized separately.
-   Use `useState` for local form/UI state and `useEffect` for effects
    such as fetching data when appropriate.
-   Use `.map()` with stable keys to render configured fields and lists.
-   Render field components based on the saved field `type`.
-   Keep the UI straightforward and maintainable; do not add unnecessary
    libraries.

------------------------------------------------------------------------

## 8. Development workflow

Work in small, verifiable steps:

1.  Understand the specific requirement.
2.  Inspect only the files needed for that requirement.
3.  Explain the intended flow and files to be changed.
4.  Make the smallest necessary implementation.
5.  Check imports, exports, route mounting, and model relationships.
6.  Run the relevant server/build/test command when appropriate.
7.  Test backend endpoints with Postman.
8.  Report exactly what changed, what was tested, and anything still
    incomplete.

Do not implement the entire application in one large generation.

------------------------------------------------------------------------

## 9. Current milestone

**Current milestone: Initial backend server setup only.**

The immediate goal is to: 1. Configure the Sequelize SQLite connection.
2. Configure the Express application. 3. Add JSON and CORS middleware.
4. Add a simple health-check endpoint. 5. Start the server successfully.
6. Verify the health-check endpoint.

Do not implement authentication, form CRUD, dynamic form rendering, or
response submission during this milestone unless explicitly requested.

After the server is working, continue one feature at a time, beginning
with the database/model foundation as agreed with the project owner.

------------------------------------------------------------------------

## 10. AI assistant working instructions --- important

When assisting with this repository:

1.  Read this `PROJECT_CONTEXT.md` first.
2.  Do **not** read every project file for every prompt.
3.  Inspect only the specific files needed for the current task.
4.  If a file path is unknown, inspect the relevant folder only.
5.  Do not re-open files whose relevant contents are already available
    in the current task context unless they may have changed.
6.  Do not rewrite working code just to impose a different style.
7.  Do not modify unrelated files.
8.  Do not create duplicate files or folders.
9.  Do not install dependencies unless the task requires them; explain
    why before adding a new dependency.
10. Do not assume a feature or requirement that has not been confirmed.
11. Before editing, briefly state the files you intend to change and
    why.
12. After editing, summarize changed files and tests performed.
13. If the requirement is unclear, ask a focused question instead of
    guessing.
14. Treat this file as project context, not as permission to make broad
    changes.

**Token/context efficiency:** Prefer targeted inspection over
repository-wide scans. Only perform a full repository review when
explicitly requested or when a task genuinely depends on understanding
the whole application.
