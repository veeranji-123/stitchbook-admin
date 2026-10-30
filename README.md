# stitchbook-admin

Super admin service for StitchBook. It listens on port **3004**.

This is not the shop owner screen. A shop owner still signs in as a tailor. This service is the platform account that can see every shop and turn a shop on or off.

The first account is created from `ADMIN_EMAIL` and `ADMIN_PASSWORD` when the admins table is empty. Later restarts do not replace that password.

Shop records stay in `stitchbook-core`. This service reads and updates them through core's internal routes.

## Routes

- `POST /api/admin/login`
- `GET /api/admin/summary`
- `GET /api/admin/shops`
- `PUT /api/admin/shops/:id/active` with `{ "isActive": 0 }` or `{ "isActive": 1 }`

The gateway forwards `/api/admin` here.

## Run

```bash
cp .env.example .env
npm install
npm start
```
