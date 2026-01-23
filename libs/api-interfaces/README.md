# API Interfaces

TypeScript type definition library shared between client and server.

## Structure

- `request/`: Request types sent from client to server
- `response/`: Response types sent from server to client

## Usage

### On Server

```typescript
import { DatabaseClientRequest, DatabaseClientResponse } from '@api-interfaces';
```

### On Client

```typescript
import { DatabaseClientRequest, DatabaseClientResponse } from '@api-interfaces';
```

## Notes

This library only contains shared types between client and server.
Server-only types (CMS request/response, etc.) are not included.
