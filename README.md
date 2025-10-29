# Chappy - Chat App

## Projektöversikt
Fullstack chat-app Chappy är en chat-applikation där användare kan skicka meddelanden till varandra eller i kanaler. Kanaler kan vara öppna eller låsta (kräver inloggning).

## Teknisk stack
- **Backend:** Node.js, Express, TypeScript, DynamoDB
- **Frontend:** React, React Router, Vite
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** AWS DynamoDB
- **Hosting:** Render (för produktion)

## Projektkrav

### Behörigheter
| Funktionalitet | Gäst | Inloggad användare |
|---|---|---|
| Se alla användare och kanaler | ✅ | ✅ |
| Skapa ny kanal (VG) | ❌ | ✅ |
| Ta bort kanal (VG) | ❌ | ✅ (bara skaparen) |
| Öppna kanaler: läsa och skicka | ✅ | ✅ |
| Låsta kanaler: läsa och skicka | ❌ | ✅ |
| Skicka DM | ❌ | ✅ |
| Registrera ny användare | ✅ | ✅ |
| Ta bort användare (VG) | ❌ | ✅ (bara sig själv) |

### Fas 1 (G)
- Grundläggande funktionalitet: kanaler, DM, användare
- Registrera och autentisera sig
- Lösenord sparas i databasen
- Snygg och användarvänlig frontend

### Fas 2 (VG)
- Lägga till kanaler
- Ta bort användares konto
- React Router och statehanteringsbibliotek (t.ex. Zustand)

---
*Uppdaterad: 2024-10-29*
