#include "column_repository.hpp"

#include <vector>

namespace kanban::repositories {

namespace {

kanban::models::BoardColumn mapRow(SQLite::Statement& stmt) {
    kanban::models::BoardColumn column;
    column.id = stmt.getColumn(0).getInt64();
    column.boardId = stmt.getColumn(1).getInt64();
    column.title = stmt.getColumn(2).getString();
    column.position = stmt.getColumn(3).getInt();
    column.createdAt = stmt.getColumn(4).getString();
    column.updatedAt = stmt.getColumn(5).getString();
    return column;
}

}

ColumnRepository::ColumnRepository(kanban::db::Database& database) : db_(database) {}

std::optional<kanban::models::BoardColumn> ColumnRepository::create(int64_t boardId, const std::string& title) {
    SQLite::Statement boardCheck(db_.handle(), "SELECT id FROM boards WHERE id = ?;");
    boardCheck.bind(1, boardId);
    if (!boardCheck.executeStep()) {
        return std::nullopt;
    }

    SQLite::Statement countStmt(db_.handle(), "SELECT COUNT(*) FROM board_columns WHERE board_id = ?;");
    countStmt.bind(1, boardId);
    countStmt.executeStep();
    const int64_t position = countStmt.getColumn(0).getInt64();

    SQLite::Statement insertStmt(
        db_.handle(),
        "INSERT INTO board_columns (board_id, title, position, created_at, updated_at) "
        "VALUES (?, ?, ?, datetime('now'), datetime('now'));");
    insertStmt.bind(1, boardId);
    insertStmt.bind(2, title);
    insertStmt.bind(3, position);
    insertStmt.exec();

    return getById(db_.handle().getLastInsertRowid());
}

std::optional<kanban::models::BoardColumn> ColumnRepository::getById(int64_t id) {
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, board_id, title, position, created_at, updated_at FROM board_columns WHERE id = ?;");
    stmt.bind(1, id);
    if (!stmt.executeStep()) {
        return std::nullopt;
    }
    return mapRow(stmt);
}

std::vector<kanban::models::BoardColumn> ColumnRepository::getByBoardId(int64_t boardId) {
    std::vector<kanban::models::BoardColumn> columns;
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, board_id, title, position, created_at, updated_at "
        "FROM board_columns WHERE board_id = ? ORDER BY position;");
    stmt.bind(1, boardId);
    while (stmt.executeStep()) {
        columns.push_back(mapRow(stmt));
    }
    return columns;
}

std::optional<kanban::models::BoardColumn> ColumnRepository::update(int64_t id, const std::string& title) {
    SQLite::Statement stmt(
        db_.handle(), "UPDATE board_columns SET title = ?, updated_at = datetime('now') WHERE id = ?;");
    stmt.bind(1, title);
    stmt.bind(2, id);
    stmt.exec();
    if (db_.handle().getChanges() == 0) {
        return std::nullopt;
    }
    return getById(id);
}

bool ColumnRepository::remove(int64_t id) {
    SQLite::Statement findStmt(db_.handle(), "SELECT board_id FROM board_columns WHERE id = ?;");
    findStmt.bind(1, id);
    if (!findStmt.executeStep()) {
        return false;
    }
    const int64_t boardId = findStmt.getColumn(0).getInt64();

    SQLite::Transaction transaction(db_.handle());

    SQLite::Statement deleteStmt(db_.handle(), "DELETE FROM board_columns WHERE id = ?;");
    deleteStmt.bind(1, id);
    deleteStmt.exec();

    SQLite::Statement remainingStmt(
        db_.handle(), "SELECT id FROM board_columns WHERE board_id = ? ORDER BY position;");
    remainingStmt.bind(1, boardId);
    std::vector<int64_t> remainingIds;
    while (remainingStmt.executeStep()) {
        remainingIds.push_back(remainingStmt.getColumn(0).getInt64());
    }

    for (size_t i = 0; i < remainingIds.size(); ++i) {
        SQLite::Statement updateStmt(db_.handle(), "UPDATE board_columns SET position = ? WHERE id = ?;");
        updateStmt.bind(1, static_cast<int64_t>(i));
        updateStmt.bind(2, remainingIds[i]);
        updateStmt.exec();
    }

    transaction.commit();
    return true;
}

}
