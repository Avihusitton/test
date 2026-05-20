# Webhook Contract: Contact Form Integration

This document defines the strict communication protocol between the static frontend and the Make.com Custom Webhook backend.

## 1. Request Specification
- **Method**: POST
- **Content-Type**: application/json
- **Endpoint**: Make.com Custom Webhook URL

### JSON Payload Schema
```json
{
  "site_source": "string (e.g., gil_therapy)",
  "name": "string",
  "phone": "string",
  "email": "string",
  "reason": "string (טיפול דיאדי ורגשי לילדים | טיפול רגשי למבוגרים)",
  "message": "string (optional)",
  "date": "string (e.g., 18.5.2026)",
  "time": "string (e.g., 13:58)"
}
```

## 2. Response Specification
- **Content-Type**: application/json

### Success Response
```json
{
  "ok": true
}
```

### Error Response
```json
{
  "ok": false,
  "error": "Reason for failure"
}
```

## 3. Implementation Rules
1. **CORS**: The Make.com webhook must be configured to accept cross-origin requests from the static site.
2. **Reliability**: If the webhook fails, the frontend must fall back to the `mailto:` protocol to ensure no lead is lost.
