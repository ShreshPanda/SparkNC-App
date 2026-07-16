# Next Task

## Recommended next module

Before implementing any change, read the relevant contracts in `docs/`:
- API boundary: `docs/API_STANDARDS.md`
- Backend structure + agent rules: `docs/AI_ENGINEERING_GUIDE.md`
- DB constraints: `docs/DATABASE_GUIDE.md`
- UX components/tokens (if UI work): `docs/DESIGN_SYSTEM.md`, `docs/UX_PRINCIPLES.md`, `docs/COMPONENT_LIBRARY.md`

1. Connect the Worker to real D1 bindings and Better Auth environment values in a deployed environment.

2. Add authentication-aware request context so task and goal mutations use the signed-in user rather than the temporary fallback.
3. Implement protected route authorization using the role and permission service.
4. Expand the persisted CRUD layer to events and messages.
5. Validate the app on web and mobile builds using the Expo preview workflow.
