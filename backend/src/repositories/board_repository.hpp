#pragma once

#include "../db/database.hpp"
#include "../models/board.hpp"

#include <optional>
#include <string>
#include <vector>

namespace kanban::repositories {

class BoardRepository {
public:
    explicit BoardRepository(kanban::db::Database& database);

    kanban::models::Board create(const std::string& title, const std::optional<std::string>& description);
    std::vector<kanban::models::Board> getAll();

private:
    kanban::db::Database& db_;
};

}
