# API Reference

Base URL (dev): `http://localhost:5000/api`

Authentication note: All `/api/*` routes require a valid `Authorization: Bearer <token>` header except `/api/auth/*`.

## Authentication

### `POST /api/auth/register`
Create a family account. Public registration is family-only; elder accounts
are created by a family member using `POST /api/family/elder`.

**Request**
```json
{
  "email": "family@example.com",
  "password": "SecurePass123",
  "name": "Sarah"
}
```

**Response `201`**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "64d...",
    "email": "family@example.com",
    "name": "Sarah",
    "role": "family",
    "linkedElderIds": []
  }
}
```

### `POST /api/auth/login`
Authenticate a user and receive a JWT. Works for both family and elder accounts.

**Request**
```json
{
  "email": "elder@example.com",
  "password": "SecurePass123"
}
```

**Response `200`**
```json
{
  "token": "eyJ...",
  "user": {
    "id": "64d...",
    "email": "elder@example.com",
    "name": "Evelyn",
    "role": "elder",
    "linkedElderIds": []
  }
}
```

## Family

All `/api/family/*` routes are protected and require a family account.

### `GET /api/family/elder`
Get the linked elder's basic info for the logged-in family account.

**Response `200`**
```json
{
  "elder": {
    "id": "64d...",
    "name": "Evelyn",
    "email": "elder@example.com"
  }
}
```

If no elder is linked:
```json
{
  "elder": null
}
```

### `GET /api/family/elders`
Get the list of elders linked to the logged-in family account.

**Response `200`**
```json
{
  "elders": [
    {
      "id": "64d...",
      "name": "Evelyn",
      "email": "elder@example.com"
    }
  ]
}
```

If no elders are linked:
```json
{
  "elders": []
}
```

### `POST /api/family/elder`
Create a new elder account and link it to the logged-in family member.

**Request**
```json
{
  "name": "Evelyn",
  "email": "elder@example.com",
  "password": "SecurePass123"
}
```

**Response `201`**
```json
{
  "elder": {
    "id": "64d...",
    "name": "Evelyn",
    "email": "elder@example.com"
  }
}
```

**Response `400`** — missing fields, password too short, or family account not found.

**Response `409`** — email already exists.

### `PUT /api/family/elder/:elderId/password`
Reset the password for a linked elder account.

**Request**
```json
{
  "password": "NewSecurePass123"
}
```

**Response `200`**
```json
{
  "message": "Password reset successfully."
}
```

**Response `400`** — password missing or too short.

**Response `403`** — elder is not linked to this family account.

---

## Medicine

All `/api/medicine/*` routes are protected.

Family accounts manage medicines for a specific linked elder identified by
`:elderId` in the URL. The `:elderId` must be one of the family's linked
elders; requests for unrelated elders return `403`.

Elder accounts manage their own medicines; the `:elderId` param is ignored
for them (it can be any value, but must be present in the URL).

### `GET /api/medicine/:elderId`
List active medicines for the elder, sorted by first scheduled time.

**Response `200`**
```json
[
  {
    "_id": "64d...",
    "userId": "64d...",
    "name": "Aspirin",
    "dosage": "1 tablet",
    "times": ["08:00", "20:00"],
    "active": true
  }
]
```

### `POST /api/medicine/:elderId`
Add a new medicine.

**Request**
```json
{
  "name": "Aspirin",
  "dosage": "1 tablet",
  "times": ["08:00", "20:00"]
}
```

**Response `201`** — the created medicine object.

### `PUT /api/medicine/:elderId/:id`
Update an existing medicine.

**Request** — same shape as POST.

**Response `200`** — the updated medicine object.

**Response `404`** — medicine not found or does not belong to this elder.

### `DELETE /api/medicine/:elderId/:id`
Remove a medicine.

**Response `200`**
```json
{ "message": "Medicine removed." }
```

**Response `404`** — medicine not found or does not belong to this elder.

---

## SOS

All `/api/sos/*` routes are protected.

Family accounts operate on a specific linked elder via `:elderId`. Elder
accounts operate on their own alerts.

### `POST /api/sos/:elderId`
Trigger an SOS alert for the elder.

**Response `201`**
```json
{
  "_id": "64d...",
  "userId": "64d...",
  "resolved": false,
  "triggeredAt": "2026-08-10T10:00:00.000Z",
  "resolvedAt": null
}
```

### `GET /api/sos/:elderId`
List SOS alerts for the elder, most recent first.

**Response `200`**
```json
[
  {
    "_id": "64d...",
    "userId": "64d...",
    "resolved": true,
    "triggeredAt": "2026-08-10T10:00:00.000Z",
    "resolvedAt": "2026-08-10T10:05:00.000Z"
  }
]
```

### `PUT /api/sos/:elderId/:id/resolve`
Mark an SOS alert as resolved.

**Response `200`** — the updated alert object.

**Response `404`** — alert not found or already resolved.

---

## Messages

All `/api/messages/*` routes are protected.

Family accounts send/list messages for a specific linked elder via `:elderId`.
Elder accounts read their own inbox.

### `POST /api/messages/:elderId`
Send a voice message to the elder.

**Request:** `multipart/form-data` or JSON with base64 audio.

| Field | Type | Notes |
|---|---|---|
| `toUserId` | string | Target user ID (must be the elder). |
| `audio` | string | Base64-encoded audio data. |
| `contentType` | string | Optional MIME type, e.g. `audio/webm`. |

**Response `201`**
```json
{
  "_id": "64d...",
  "fromUserId": "64d...",
  "toUserId": "64d...",
  "audioContentType": "audio/webm",
  "transcript": "",
  "playedAt": null,
  "createdAt": "2026-08-10T10:00:00.000Z"
}
```

### `GET /api/messages/:elderId`
List messages for the elder (family sees both directions; elder sees inbox only).

**Response `200`**
```json
[
  {
    "_id": "64d...",
    "fromUserId": "64d...",
    "toUserId": "64d...",
    "audioBase64": "...",
    "audioContentType": "audio/webm",
    "transcript": "",
    "playedAt": null,
    "createdAt": "2026-08-10T10:00:00.000Z"
  }
]
```

### `PUT /api/messages/:elderId/:id/played`
Mark a message as played.

**Response `200`** — the updated message object.

**Response `404`** — message not found or already played.

---

## Reports

All `/api/reports/*` routes are protected. Family users view reports for
their linked elder; elders view their own.

> **Note:** These reports describe communication patterns only — they are
> explicitly non-diagnostic and do not assess health, cognition, or
> wellbeing.

### `GET /api/reports/:elderId/weekly`
Aggregate the elder's `ConversationLog` entries from the last 7 days and
compare them with the prior 7 days.

For family accounts, `:elderId` must be one of their linked elders.

**Response `200`**
```json
{
  "elderId": "64d...",
  "period": {
    "start": "2026-08-02T00:00:00.000Z",
    "end": "2026-08-08T23:59:59.999Z"
  },
  "totalSessions": 5,
  "avgWordCount": 12,
  "avgSentenceComplexity": 6.4,
  "priorWeekAvgSentenceComplexity": 5.8,
  "complexityTrend": "up",
  "repeatedWords": [
    { "word": "medicine", "count": 4 },
    { "word": "breakfast", "count": 3 }
  ],
  "daysWithNoConversation": [],
  "dailySessions": [
    { "date": "2026-08-02", "count": 1 },
    { "date": "2026-08-03", "count": 2 }
  ],
  "dailyWordCount": [
    { "date": "2026-08-02", "avgWordCount": 10 },
    { "date": "2026-08-03", "avgWordCount": 14 }
  ],
  "flags": [
    { "level": "good", "message": "Talking regularly, nothing unusual to flag." }
  ],
  "plainLanguageSummary": "They spoke a bit more this week than last week (5 sessions vs 3 last week). On average, each reply was about 12 words. The sentences they used were slightly longer than the week before — this is just a pattern in how they chose to speak. The most common topics that came up were: medicine, breakfast, family. There were no days with no recorded conversation. This is only a summary of communication patterns — it is not a health or medical assessment."
}
```

---

## Voice

All `/api/voice/*` routes are protected. Elder accounts operate on their own
voice data. Family accounts cannot access voice routes.

### `POST /api/voice/transcribe`
Converts recorded audio to text via Groq Whisper.

**Request:** `multipart/form-data`
| Field | Type | Notes |
|---|---|---|
| `audio` | File | webm/wav audio blob from the browser recorder |

**Response `200`**
```json
{
  "text": "I took my medicine this morning"
}
```

**Response `413`** — audio file too large (max 10 MB).

### `POST /api/voice/speak`
Converts text to speech via ElevenLabs.

**Request**
```json
{
  "text": "Hello! How are you feeling today?"
}
```

**Response `200`** — audio/mpeg stream.

### `POST /api/voice/process`
Full turn: transcribe elder speech, generate AI response, speak it back.

**Request:** `multipart/form-data` with `audio` file.

**Response `200`**
```json
{
  "transcript": "I took my medicine this morning",
  "response": "That is wonderful to hear! How are you feeling today?",
  "audioBase64": "...",
  "metrics": {
    "wordCount": 8,
    "uniqueWordCount": 6,
    "sentenceCount": 1,
    "avgWordsPerSentence": 8.0
  }
}
```

---

## Chat

All `/api/chat/*` routes are protected. Elder accounts operate on their own
chat data. Family accounts cannot access chat routes.

### `GET /api/chat/history`
List chat messages for the elder.

**Response `200`**
```json
[
  {
    "_id": "64d...",
    "userId": "64d...",
    "role": "assistant",
    "content": "Hello! How can I help you today?",
    "createdAt": "2026-08-10T10:00:00.000Z"
  }
]
```

### `POST /api/chat/message`
Send a chat message and get an AI response.

**Request**
```json
{
  "message": "What is the weather like today?"
}
```

**Response `200`**
```json
{
  "userMessage": {
    "_id": "64d...",
    "role": "user",
    "content": "What is the weather like today?"
  },
  "assistantMessage": {
    "_id": "64d...",
    "role": "assistant",
    "content": "I do not have access to real-time weather data..."
  }
}
```

### `POST /api/chat/clear`
Clear chat history for the elder.

**Response `200`**
```json
{ "message": "Chat history cleared." }
```
