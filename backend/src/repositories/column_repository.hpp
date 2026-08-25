#pragma once

#include "../db/database.hpp"
#include "../models/board_column.hpp"

#include <optional>
#include <string>
#include <vector>

namespace kanban::repositories {

class ColumnRepository {
public:
    explicit ColumnRepository(kanban::db::Database& database);

    std::optional<kanban::models::BoardColumn> create(int64_t boardId, const std::string& title);
    std::optional<kanban::models::BoardColumn> getById(int64_t id);
    std::vector<kanban::models::BoardColumn> getByBoardId(int64_t boardId);
    std::optional<kanban::models::BoardColumn> update(int64_t id, const std::string& title);
    bool remove(int64_t id);

private:
    kanban::db::Database& db_;
};

}
