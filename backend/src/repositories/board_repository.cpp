#include "board_repository.hpp"

namespace kanban::repositories {

namespace {

kanban::models::Board mapRow(SQLite::Statement& stmt) {
    kanban::models::Board board;
    board.id = stmt.getColumn(0).getInt64();
    board.ownerId = stmt.getColumn(1).getInt64();
    board.title = stmt.getColumn(2).getString();
    board.description = stmt.getColumn(3).isNull()
        ? std::nullopt
        : std::optional<std::string>(stmt.getColumn(3).getString());
    board.createdAt = stmt.getColumn(4).getString();
    board.updatedAt = stmt.getColumn(5).getString();
    return board;
}

}

BoardRepository::BoardRepository(kanban::db::Database& database) : db_(database) {}

kanban::models::Board BoardRepository::create(
    int64_t ownerId,
    const std::string& title,
    const std::optional<std::string>& description) {
    SQLite::Statement insertStmt(
        db_.handle(),
        "INSERT INTO boards (owner_id, title, description, created_at, updated_at) "
        "VALUES (?, ?, ?, datetime('now'), datetime('now'));");
    insertStmt.bind(1, ownerId);
    insertStmt.bind(2, title);
    if (description.has_value()) {
        insertStmt.bind(3, *description);
    } else {
        insertStmt.bind(3);
    }
    insertStmt.exec();

    const int64_t newId = db_.handle().getLastInsertRowid();

    SQLite::Statement selectStmt(
        db_.handle(),
        "SELECT id, owner_id, title, description, created_at, updated_at FROM boards WHERE id = ?;");
    selectStmt.bind(1, newId);
    selectStmt.executeStep();
    return mapRow(selectStmt);
}

std::vector<kanban::models::Board> BoardRepository::getAllByOwner(int64_t ownerId) {
    std::vector<kanban::models::Board> boards;
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, owner_id, title, description, created_at, updated_at FROM boards WHERE owner_id = ? ORDER BY id;");
    stmt.bind(1, ownerId);
    while (stmt.executeStep()) {
        boards.push_back(mapRow(stmt));
    }
    return boards;
}

std::optional<kanban::models::Board> BoardRepository::getById(int64_t id) {
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, owner_id, title, description, created_at, updated_at FROM boards WHERE id = ?;");
    stmt.bind(1, id);
    if (!stmt.executeStep()) {
        return std::nullopt;
    }
    return mapRow(stmt);
}

bool BoardRepository::ownedBy(int64_t boardId, int64_t ownerId) {
    auto board = getById(boardId);
    return board.has_value() && board->ownerId == ownerId;
}

std::optional<kanban::models::Board> BoardRepository::update(int64_t id, const BoardUpdate& changes) {
    std::string setClause;
    if (changes.title.has_value()) {
        setClause += "title = ?, ";
    }
    if (changes.description.has_value()) {
        setClause += "description = ?, ";
    }
    if (setClause.empty()) {
        return getById(id);
    }
    setClause += "updated_at = datetime('now')";

    SQLite::Statement stmt(db_.handle(), "UPDATE boards SET " + setClause + " WHERE id = ?;");
    int index = 1;
    if (changes.title.has_value()) {
        stmt.bind(index++, *changes.title);
    }
    if (changes.description.has_value()) {
        if (changes.description->has_value()) {
            stmt.bind(index++, **changes.description);
        } else {
            stmt.bind(index++);
        }
    }
    stmt.bind(index, id);
    stmt.exec();

    if (db_.handle().getChanges() == 0) {
        return std::nullopt;
    }
    return getById(id);
}

bool BoardRepository::remove(int64_t id) {
    SQLite::Statement stmt(db_.handle(), "DELETE FROM boards WHERE id = ?;");
    stmt.bind(1, id);
    stmt.exec();
    return db_.handle().getChanges() > 0;
}

}
