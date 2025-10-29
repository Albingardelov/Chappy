# DynamoDB Schema Design

## Tabellstruktur

### Huvudtabell: ChappyData
```
PK: entityType#entityId (t.ex. "USER#albin", "CHANNEL#general")
SK: metadataType (t.ex. "PROFILE", "METADATA", "CONTENT")
```

### Entiteter:

**Användare:**
```json
{
  "PK": "USER#albin",
  "SK": "PROFILE",
  "username": "albin",
  "email": "albin@example.com",
  "passwordHash": "hashed_password"
}
```

**Kanaler:**
```json
{
  "PK": "CHANNEL#general",
  "SK": "METADATA",
  "channelName": "general",
  "isLocked": false,
  "createdBy": "USER#albin"
}
```

**Meddelanden:**
```json
{
  "PK": "MESSAGE#1234567890",
  "SK": "CONTENT",
  "channelId": "CHANNEL#general",
  "timestamp": "2024-01-01T00:00:00Z",
  "senderId": "USER#albin",
  "content": "Hej alla!"
}
```

### GSI: ChannelMessages
- Partition Key: `channelId`
- Sort Key: `timestamp`
- Används för att hämta alla meddelanden i en kanal

## Designbeslut
- En enda tabell istället för separata tabeller (kostnadseffektivt)
- GSI för att kunna hämta meddelanden per kanal snabbt
- Beskrivande attributnamn för tydlighet
