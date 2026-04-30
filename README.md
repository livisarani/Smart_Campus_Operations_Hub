# Smart Campus Operations Hub

## Run (Frontend)

From the project root:

- Install deps: `npm run frontend:install`
- Start dev server: `npm run dev`

Or run directly from the frontend folder:

- `cd frontend`
- `npm install`
- `npm run dev`

## Run (Backend)

From the project root:

- `./mvnw spring-boot:run`

Notes:
- Don’t run `npm` commands inside the backend `src/` folder — it has no `package.json`.

## Continue With Google (OAuth2) Setup

Use these values in Google Cloud Console and local environment variables.

### 1. Google Cloud Console

1. Open Google Cloud Console -> APIs & Services -> Credentials.
2. Create credentials: OAuth client ID.
3. Application type: Web application.
4. Add Authorized JavaScript origins:
	- `http://localhost:3000`
5. Add Authorized redirect URIs:
	- `http://localhost:8081/oauth2/callback/google`

### 2. Backend Environment Variables

Set these before starting backend:

- `GOOGLE_CLIENT_ID=<your_google_client_id>`
- `GOOGLE_CLIENT_SECRET=<your_google_client_secret>`
- `APP_OAUTH2_REDIRECT_URI=http://localhost:3000/oauth2/redirect`

PowerShell example:

```powershell
$env:GOOGLE_CLIENT_ID="your-google-client-id"
$env:GOOGLE_CLIENT_SECRET="your-google-client-secret"
$env:APP_OAUTH2_REDIRECT_URI="http://localhost:3000/oauth2/redirect"
./mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

### 3. Frontend (optional override)

By default, frontend uses same-origin `/oauth2/...` and Vite proxy.
If needed, set:

- `VITE_OAUTH_BASE_URL=http://localhost:8081`

### 4. Expected Flow

1. Click `Continue with Google` on `/login`.
2. Browser goes to `/oauth2/authorize/google`.
3. Google redirects backend to `/oauth2/callback/google`.
4. Backend redirects frontend to `/oauth2/redirect?token=...&refreshToken=...`.
