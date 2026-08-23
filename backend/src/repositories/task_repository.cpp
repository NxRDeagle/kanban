#include "task_repository.hpp"

#include <algorithm>
#include <vector>

namespace kanban::repositories {

namespace {

kanban::models::Task mapRow(SQLite::Statement& stmt) {
    kanban::models::Task task;
    task.id = stmt.getColumn(0).getInt64();
    task.columnId = stmt.getColumn(1).getInt64();
    task.title = stmt.getColumn(2).getString();
    task.description = stmt.getColumn(3).isNull()
        ? std::nullopt
        : std::optional<std::string>(stmt.getColumn(3).getString());
    task.position = stmt.getColumn(4).getInt();
    task.createdAt = stmt.getColumn(5).getString();
    task.updatedAt = stmt.getColumn(6).getString();
    return task;
}

void setPositions(SQLite::Database& db, const std::vector<int64_t>& ids) {
    for (size_t i = 0; i < ids.size(); ++i) {
        SQLite::Statement updateStmt(db, "UPDATE tasks SET position = ? WHERE id = ?;");
        updateStmt.bind(1, static_cast<int64_t>(i));
        updateStmt.bind(2, ids[i]);
        updateStmt.exec();
    }
}

}

TaskRepository::TaskRepository(kanban::db::Database& database) : db_(database) {}

std::optional<kanban::models::Task> TaskRepository::create(
    int64_t columnId,
    const std::string& title,
    const std::optional<std::string>& description) {
    SQLite::Statement columnCheck(db_.handle(), "SELECT id FROM board_columns WHERE id = ?;");
    columnCheck.bind(1, columnId);
    if (!columnCheck.executeStep()) {
        return std::nullopt;
    }

    SQLite::Statement countStmt(db_.handle(), "SELECT COUNT(*) FROM tasks WHERE column_id = ?;");
    countStmt.bind(1, columnId);
    countStmt.executeStep();
    const int64_t position = countStmt.getColumn(0).getInt64();

    SQLite::Statement insertStmt(
        db_.handle(),
        "INSERT INTO tasks (column_id, title, description, position, created_at, updated_at) "
        "VALUES (?, ?, ?, ?, datetime('now'), datetime('now'));");
    insertStmt.bind(1, columnId);
    insertStmt.bind(2, title);
    if (description.has_value()) {
        insertStmt.bind(3, *description);
    } else {
        insertStmt.bind(3);
    }
    insertStmt.bind(4, position);
    insertStmt.exec();

    return getById(db_.handle().getLastInsertRowid());
}

std::optional<kanban::models::Task> TaskRepository::getById(int64_t id) {
    SQLite::Statement stmt(
        db_.handle(),
        "SELECT id, column_id, title, description, position, created_at, updated_at FROM tasks WHERE id = ?;");
    stmt.bind(1, id);
    if (!stmt.executeStep()) {
        return std::nullopt;
    }
    return mapRow(stmt);
}

std::optional<kanban::models::Task> TaskRepository::update(int64_t id, const TaskUpdate& changes) {
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

    SQLite::Statement stmt(db_.handle(), "UPDATE tasks SET " + setClause + " WHERE id = ?;");
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

bool TaskRepository::remove(int64_t id) {
    SQLite::Statement findStmt(db_.handle(), "SELECT column_id FROM tasks WHERE id = ?;");
    findStmt.bind(1, id);
    if (!findStmt.executeStep()) {
        return false;
    }
    const int64_t columnId = findStmt.getColumn(0).getInt64();

    SQLite::Transaction transaction(db_.handle());

    SQLite::Statement deleteStmt(db_.handle(), "DELETE FROM tasks WHERE id = ?;");
    deleteStmt.bind(1, id);
    deleteStmt.exec();

    SQLite::Statement remainingStmt(
        db_.handle(), "SELECT id FROM tasks WHERE column_id = ? ORDER BY position;");
    remainingStmt.bind(1, columnId);
    std::vector<int64_t> remainingIds;
    while (remainingStmt.executeStep()) {
        remainingIds.push_back(remainingStmt.getColumn(0).getInt64());
    }
    setPositions(db_.handle(), remainingIds);

    transaction.commit();
    return true;
}

std::optional<kanban::models::Task> TaskRepository::move(int64_t id, int64_t toColumnId, int toPosition) {
    auto existing = getById(id);
    if (!existing.has_value()) {
        return std::nullopt;
    }

    SQLite::Statement columnCheck(db_.handle(), "SELECT id FROM board_columns WHERE id = ?;");
    columnCheck.bind(1, toColumnId);
    if (!columnCheck.executeStep()) {
        return std::nullopt;
    }

    SQLite::Transaction transaction(db_.handle());

    if (existing->columnId == toColumnId) {
        SQLite::Statement siblingsStmt(
            db_.handle(), "SELECT id FROM tasks WHERE column_id = ? AND id != ? ORDER BY position;");
        siblingsStmt.bind(1, existing->columnId);
        siblingsStmt.bind(2, id);
        std::vector<int64_t> siblingIds;
        while (siblingsStmt.executeStep()) {
            siblingIds.push_back(siblingsStmt.getColumn(0).getInt64());
        }

        const int clamped = std::max(0, std::min(toPosition, static_cast<int>(siblingIds.size())));
        siblingIds.insert(siblingIds.begin() + clamped, id);
        setPositions(db_.handle(), siblingIds);
    } else {
        SQLite::Statement sourceStmt(
            db_.handle(), "SELECT id FROM tasks WHERE column_id = ? AND id != ? ORDER BY position;");
        sourceStmt.bind(1, existing->columnId);
        sourceStmt.bind(2, id);
        std::vector<int64_t> sourceIds;
        while (sourceStmt.executeStep()) {
            sourceIds.push_back(sourceStmt.getColumn(0).getInt64());
        }
        setPositions(db_.handle(), sourceIds);

        SQLite::Statement destStmt(
            db_.handle(), "SELECT id FROM tasks WHERE column_id = ? ORDER BY position;");
        destStmt.bind(1, toColumnId);
        std::vector<int64_t> destIds;
        while (destStmt.executeStep()) {
            destIds.push_back(destStmt.getColumn(0).getInt64());
        }

        const int clamped = std::max(0, std::min(toPosition, static_cast<int>(destIds.size())));
        destIds.insert(destIds.begin() + clamped, id);
        setPositions(db_.handle(), destIds);
    }

    SQLite::Statement movedStmt(
        db_.handle(),
        "UPDATE tasks SET column_id = ?, updated_at = datetime('now') WHERE id = ?;");
    movedStmt.bind(1, toColumnId);
    movedStmt.bind(2, id);
    movedStmt.exec();

    transaction.commit();
    return getById(id);
}

}
