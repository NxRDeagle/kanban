#include "board_repository.hpp"

#include <set>

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
    board.position = stmt.getColumn(6).getInt();
    return board;
}

void setPositions(SQLite::Database& db, const std::vector<int64_t>& ids) {
    for (size_t i = 0; i < ids.size(); ++i) {
        SQLite::Statement updateStmt(db, "UPDATE boards SET position = ? WHERE id = ?;");
        updateStmt.bind(1, static_cast<int64_t>(i));
        updateStmt.bind(2, ids[i]);
        updateStmt.exec();
    }
}

}

BoardRepository::BoardRepository(kanban::db::Database& database) : db_(database) {}

kanban::models::Board BoardRepository::create(
    int64_t ownerId,
    const std::string& title,
    const std::optional<std::string>& description) {
    SQLite::Statement countStmt(db_.handle(), "SELECT COUNT(*) FROM boards WHERE owner_id = ?;");
    countStmt.bind(1, ownerId);
    countStmt.executeStep();
    const int64_t position = countStmt.getColumn(0).getInt64();

    SQLite::Statement insertStmt(
        db_.handle(),
        "INSERT INTO boards (owner_id, title, description, position, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, datetime('now'), datetime('now'));");
    insertStmt.bind(1, ownerId);
    insertStmt.bind(2, title);
    if (description.has_value()) {
        insertStmt.bind(3, *description);
    } else {
        insertStmt.bind(3);
    }
    insertStmt.bind(4, position);
    insertStmt.exec();

    return *getById(db_.handle().getLastInsertRowid());
}

std::vector<kanban::models::Board> BoardRepository::getAllByOwner(int64_t ownerId) {
    std::vector<kanban::models::Board> boards;
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, owner_id, title, description, created_at, updated_at, position "
        "FROM boards WHERE owner_id = ? ORDER BY position, id;");
    stmt.bind(1, ownerId);
    while (stmt.executeStep()) {
        boards.push_back(mapRow(stmt));
    }
    return boards;
}

std::optional<kanban::models::Board> BoardRepository::getById(int64_t id) {
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, owner_id, title, description, created_at, updated_at, position "
        "FROM boards WHERE id = ?;");
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
    SQLite::Statement findStmt(db_.handle(), "SELECT owner_id FROM boards WHERE id = ?;");
    findStmt.bind(1, id);
    if (!findStmt.executeStep()) {
        return false;
    }
    const int64_t ownerId = findStmt.getColumn(0).getInt64();

    SQLite::Transaction transaction(db_.handle());

    SQLite::Statement deleteStmt(db_.handle(), "DELETE FROM boards WHERE id = ?;");
    deleteStmt.bind(1, id);
    deleteStmt.exec();

    SQLite::Statement remainingStmt(
        db_.handle(), "SELECT id FROM boards WHERE owner_id = ? ORDER BY position, id;");
    remainingStmt.bind(1, ownerId);
    std::vector<int64_t> remainingIds;
    while (remainingStmt.executeStep()) {
        remainingIds.push_back(remainingStmt.getColumn(0).getInt64());
    }
    setPositions(db_.handle(), remainingIds);

    transaction.commit();
    return true;
}

bool BoardRepository::reorder(int64_t ownerId, const std::vector<int64_t>& orderedIds) {
    const auto existing = getAllByOwner(ownerId);
    if (existing.size() != orderedIds.size()) {
        return false;
    }

    std::set<int64_t> existingIds;
    for (const auto& board : existing) {
        existingIds.insert(board.id);
    }
    std::set<int64_t> requestedIds(orderedIds.begin(), orderedIds.end());
    if (existingIds != requestedIds) {
        return false;
    }

    SQLite::Transaction transaction(db_.handle());
    setPositions(db_.handle(), orderedIds);
    transaction.commit();
    return true;
}

}
