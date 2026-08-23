#pragma once

#include "../db/database.hpp"
#include "../models/task.hpp"

#include <optional>
#include <string>

namespace kanban::repositories {

struct TaskUpdate {
    std::optional<std::string> title;
    std::optional<std::optional<std::string>> description;
};

class TaskRepository {
public:
    explicit TaskRepository(kanban::db::Database& database);

    std::optional<kanban::models::Task> create(
        int64_t columnId,
        const std::string& title,
        const std::optional<std::string>& description);
    std::optional<kanban::models::Task> getById(int64_t id);
    std::optional<kanban::models::Task> update(int64_t id, const TaskUpdate& changes);
    bool remove(int64_t id);
    std::optional<kanban::models::Task> move(int64_t id, int64_t toColumnId, int toPosition);

private:
    kanban::db::Database& db_;
};

}
