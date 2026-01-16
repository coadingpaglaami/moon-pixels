# Server Dependency Flow Diagram

## Visual Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    User Opens Frontend                       │
│                   (http://localhost:3000)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   app/layout.tsx loads                       │
│              Wraps app with <ServerGuard>                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              ServerGuard Component Mounts                    │
│         Calls checkServerConnection() from lib               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              lib/server-check.ts executes                    │
│    Attempts fetch to NEXT_PUBLIC_SERVER_URL (port 4000)     │
│              Timeout: 5 seconds, Retries: 3                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    Is Server Running?
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ✅ YES                           ❌ NO
         │                               │
         ▼                               ▼
┌─────────────────────┐     ┌─────────────────────────┐
│  ServerGuard shows  │     │  ServerGuard shows      │
│  loading spinner    │     │  error screen with:     │
│  briefly, then      │     │  • Warning icon         │
│  renders children   │     │  • Error message        │
│                     │     │  • Start instructions   │
│  ↓                  │     │  • Retry button         │
│                     │     │                         │
│  App loads normally │     │  User cannot proceed    │
│  User can interact  │     │  until server starts    │
└─────────────────────┘     └─────────────────────────┘
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    app/layout.tsx                       │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │            ServerGuard Component                  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │      lib/server-check.ts                   │  │  │  │
│  │  │  │                                            │  │  │  │
│  │  │  │  checkServerConnection()                   │  │  │  │
│  │  │  │         │                                  │  │  │  │
│  │  │  │         ▼                                  │  │  │  │
│  │  │  │  fetch(SERVER_URL, {method: 'HEAD'})      │  │  │  │
│  │  │  │         │                                  │  │  │  │
│  │  │  │         ▼                                  │  │  │  │
│  │  │  │  Returns: {isRunning: boolean}            │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  │                                                   │  │  │
│  │  │  Based on result:                                │  │  │
│  │  │  • Show loading                                  │  │  │
│  │  │  • Show error                                    │  │  │
│  │  │  • Render children (app content)                 │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  If server running:                                    │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │         ReownProvider                            │  │  │
│  │  │         App Content                              │  │  │
│  │  │         (page.tsx, etc.)                         │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ HTTP HEAD Request
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    Backend Server                             │
│                  (http://localhost:4000)                      │
│                                                               │
│  • Express.js server                                          │
│  • No modifications needed                                    │
│  • Just needs to be running                                   │
└──────────────────────────────────────────────────────────────┘
```

## State Machine

```
┌─────────────┐
│   Initial   │
│   State     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Checking   │◄──────────┐
│   Server    │           │
└──────┬──────┘           │
       │                  │
       ▼                  │
  Is Running?             │
       │                  │
   ┌───┴───┐              │
   │       │              │
   ▼       ▼              │
  YES      NO             │
   │       │              │
   │       ▼              │
   │  ┌─────────────┐    │
   │  │   Server    │    │
   │  │    Down     │    │
   │  │   (Error)   │    │
   │  └──────┬──────┘    │
   │         │            │
   │         │ User       │
   │         │ clicks     │
   │         │ Retry      │
   │         └────────────┘
   │
   ▼
┌─────────────┐
│   Server    │
│   Running   │
│  (Success)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Render App │
│   Content   │
└─────────────┘
```

## File Dependencies

```
app/layout.tsx
    │
    ├─ imports ServerGuard ──► components/ServerGuard.tsx
    │                               │
    │                               ├─ imports checkServerConnection
    │                               │
    │                               └─► lib/server-check.ts
    │                                       │
    │                                       └─ uses NEXT_PUBLIC_SERVER_URL
    │                                           from .env.local
    │
    └─ wraps children with <ServerGuard>
```

## Environment Configuration Flow

```
.env.local
    │
    └─ NEXT_PUBLIC_SERVER_URL=http://localhost:4000
            │
            ▼
    Next.js build process
            │
            ▼
    Available as process.env.NEXT_PUBLIC_SERVER_URL
            │
            ▼
    lib/server-check.ts reads it
            │
            ▼
    Used in fetch() call to check server
```

## Error Handling

```
checkServerConnection()
    │
    ├─ Try fetch with timeout
    │   │
    │   ├─ Success (status < 500) ──► {isRunning: true}
    │   │
    │   └─ Network Error ──► {isRunning: false, error: message}
    │
    └─ Timeout (5 seconds) ──► {isRunning: false, error: "timeout"}
```

## Retry Mechanism

```
waitForServer(maxRetries = 3)
    │
    ├─ Attempt 1 ──► checkServerConnection()
    │   │
    │   ├─ Success ──► return true
    │   │
    │   └─ Fail ──► wait 2 seconds
    │
    ├─ Attempt 2 ──► checkServerConnection()
    │   │
    │   ├─ Success ──► return true
    │   │
    │   └─ Fail ──► wait 2 seconds
    │
    └─ Attempt 3 ──► checkServerConnection()
        │
        ├─ Success ──► return true
        │
        └─ Fail ──► return false
```
