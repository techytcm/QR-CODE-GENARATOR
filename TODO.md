# TODO: Consolidate to Python Backend with Authentication

## Current Status
- Flask app (app.py) has authentication implemented with routes: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/status
- Node.js server (server.js) serves static files and has additional routes for analytics and QR
- Frontend (index.html, script.js) interacts with Flask backend for auth and QR generation

## Tasks
- [ ] Modify Flask app to serve static files (index.html, style.css, script.js, animations.css)
- [ ] Remove Node.js related files (server.js, package.json, controllers/, middleware/, routes/, utils/ except database.js if needed)
- [ ] Update Flask app to handle analytics routes if needed
- [ ] Test the consolidated backend
- [ ] Update README if necessary

## Notes
- Keep the existing authentication system in Flask
- Ensure static file serving works for the frontend
- The QR generation route in Flask is already implemented
