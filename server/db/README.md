# Database Setup Guide

Complete guide for setting up and managing the PostgreSQL database for PromptLingo.

## 📋 Prerequisites

- PostgreSQL database (Render.com, local, or other provider)
- Node.js installed
- Environment variables configured

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install pg dotenv
```

### 2. Configure Environment Variables

Create a `.env` file in the server directory:

```bash
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
NODE_ENV=development
```

For **Render.com**, use the "External Database URL" from your dashboard.

### 3. Run Migration

Create database tables:

```bash
npm run db:migrate
```

### 4. Test Connection

Verify database is working:

```bash
npm run db:test
```

### 5. Seed Data (Optional)

Add test users for development:

```bash
npm run db:seed
```

## 📦 NPM Scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate` | Create database tables and indexes |
| `npm run db:test` | Test database connection and show schema |
| `npm run db:seed` | Add test data (development only) |
| `npm run dev` | Start server in development mode |
| `npm start` | Start server in production mode |

## 🗄️ Database Schema

### Users Table

Stores user account information from Google OAuth.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `google_id` | VARCHAR(255) | Unique Google ID |
| `email` | VARCHAR(255) | User email (unique) |
| `name` | VARCHAR(255) | User's full name |
| `avatar_url` | VARCHAR(500) | Profile picture URL |
| `created_at` | TIMESTAMP | Account creation time |
| `last_login` | TIMESTAMP | Last login time |
| `preferences` | JSONB | User preferences (language, tone, etc.) |
| `settings` | JSONB | User settings |
| `is_active` | BOOLEAN | Account active status |

### Sessions Table

Stores active user sessions with JWT tokens.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `access_token` | TEXT | JWT access token |
| `refresh_token` | VARCHAR(500) | Refresh token |
| `created_at` | TIMESTAMP | Session creation time |
| `expires_at` | TIMESTAMP | Session expiry time |
| `last_activity` | TIMESTAMP | Last activity timestamp |
| `is_valid` | BOOLEAN | Session validity flag |

## 🔍 Troubleshooting

### Connection Issues

**Error: `ECONNREFUSED`**
- Database is not running
- Check DATABASE_URL is correct
- Verify network connectivity

**Error: `SSL required`**
- Add `?sslmode=require` to DATABASE_URL
- Or ensure SSL is enabled in connection config

**Error: `Authentication failed`**
- Check username and password in DATABASE_URL
- Verify database user has proper permissions

### Migration Issues

**Error: `relation already exists`**
- Tables already created
- This is safe to ignore
- Migration uses `IF NOT EXISTS`

**Error: `permission denied`**
- Database user lacks CREATE TABLE permission
- Contact database administrator

### Common Solutions

1. **Reset DATABASE_URL**
   ```bash
   # Check current value
   echo $DATABASE_URL
   
   # Update in .env file
   DATABASE_URL=postgresql://...
   ```

2. **Test connection manually**
   ```bash
   npm run db:test
   ```

3. **Check Render dashboard**
   - Verify database is active
   - Check connection info
   - View logs for errors

4. **Restart server**
   ```bash
   # Kill existing process
   pkill -f "node index.js"
   
   # Start fresh
   npm run dev
   ```

## 🔐 Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`
   - Use environment variables in production

2. **Use strong passwords**
   - Render generates secure passwords
   - Don't reuse passwords

3. **Enable SSL in production**
   - Required for Render.com
   - Automatically configured

4. **Rotate tokens regularly**
   - Implement token refresh
   - Clean up expired sessions

## 📊 Monitoring

### Check Database Stats

```bash
curl http://localhost:3001/api/health/stats
```

### Check Connection Status

```bash
curl http://localhost:3001/api/health/db-status
```

### View Logs

Server logs show:
- Connection events
- Query execution (in development)
- Errors and warnings

## 🛠️ Maintenance

### Clean Up Expired Sessions

Sessions are automatically marked invalid when expired. To permanently delete old sessions:

```javascript
// In your code
const sessionService = require('./services/sessionService');
await sessionService.deleteOldSessions(30); // Delete sessions older than 30 days
```

### Backup Database

**Render.com:**
- Automatic daily backups on paid plans
- Manual backups via dashboard

**Local PostgreSQL:**
```bash
pg_dump -U username database_name > backup.sql
```

### Restore Database

```bash
psql -U username database_name < backup.sql
```

## 📚 Additional Resources

- [Render PostgreSQL Docs](https://render.com/docs/databases)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg Library](https://node-postgres.com/)

## 🆘 Getting Help

If you encounter issues:

1. Check server logs
2. Run `npm run db:test`
3. Verify environment variables
4. Check Render dashboard
5. Review this README

## 🎯 Next Steps

After database setup:

1. ✅ Database connected
2. ✅ Tables created
3. ✅ Test connection successful
4. 🔄 Start server: `npm run dev`
5. 🔄 Test authentication endpoints
6. 🔄 Integrate with frontend

---

**Need help?** Check the troubleshooting section or review server logs for detailed error messages.
