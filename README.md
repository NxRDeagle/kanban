# Kanban Board

Личный канбан: доски, колонки, карточки, drag-and-drop, регистрация и логин через JWT.

**Frontend:** React, TypeScript, Vite, React Router, TanStack Query, Zustand, dnd-kit.

**Backend:** C++20, Crow, SQLite (SQLiteCpp), nlohmann/json, JWT, libsodium (Argon2).

### Запуск
1. cmake --build --preset default
2. cd build
3. .\kanban_server.exe
```
Сервер слушает http://localhost:8080.
Файл `kanban.db` создаётся в `backend/build`.
Опционально задать JWT-секрет:
$env:KANBAN_JWT_SECRET = "replace-me"
```

4. cd frontend
5. npm i
6. npm run dev
```
Открыть http://localhost:5173.
