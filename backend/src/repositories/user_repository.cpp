#include "user_repository.hpp"

namespace kanban::repositories {

namespace {

kanban::models::User mapRow(SQLite::Statement& stmt) {
    kanban::models::User user;
    user.id = stmt.getColumn(0).getInt64();
    user.email = stmt.getColumn(1).getString();
    user.username = stmt.getColumn(2).getString();
    user.passwordHash = stmt.getColumn(3).getString();
    user.createdAt = stmt.getColumn(4).getString();
    user.updatedAt = stmt.getColumn(5).getString();
    return user;
}

}

UserRepository::UserRepository(kanban::db::Database& database) : db_(database) {}

kanban::models::User UserRepository::create(
    const std::string& email,
    const std::string& username,
    const std::string& passwordHash) {
    SQLite::Statement insertStmt(
        db_.handle(),
        "INSERT INTO users (email, username, password_hash, created_at, updated_at) "
        "VALUES (?, ?, ?, datetime('now'), datetime('now'));");
    insertStmt.bind(1, email);
    insertStmt.bind(2, username);
    insertStmt.bind(3, passwordHash);
    insertStmt.exec();

    return *getById(db_.handle().getLastInsertRowid());
}

std::optional<kanban::models::User> UserRepository::getById(int64_t id) {
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE id = ?;");
    stmt.bind(1, id);
    if (!stmt.executeStep()) {
        return std::nullopt;
    }
    return mapRow(stmt);
}

std::optional<kanban::models::User> UserRepository::getByEmail(const std::string& email) {
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE email = ?;");
    stmt.bind(1, email);
    if (!stmt.executeStep()) {
        return std::nullopt;
    }
    return mapRow(stmt);
}

std::optional<kanban::models::User> UserRepository::getByUsername(const std::string& username) {
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, email, username, password_hash, created_at, updated_at FROM users WHERE username = ?;");
    stmt.bind(1, username);
    if (!stmt.executeStep()) {
        return std::nullopt;
    }
    return mapRow(stmt);
}

}
