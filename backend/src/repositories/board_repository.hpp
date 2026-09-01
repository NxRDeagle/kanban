#pragma once

#include "../db/database.hpp"
#include "../models/board.hpp"

#include <optional>
#include <string>
#include <vector>

namespace kanban::repositories {

struct BoardUpdate {
    std::optional<std::string> title;
    std::optional<std::optional<std::string>> description;
};

class BoardRepository {
public:
    explicit BoardRepository(kanban::db::Database& database);

    kanban::models::Board create(
        int64_t ownerId,
        const std::string& title,
        const std::optional<std::string>& description);
    std::vector<kanban::models::Board> getAllByOwner(int64_t ownerId);
    std::optional<kanban::models::Board> getById(int64_t id);
    bool ownedBy(int64_t boardId, int64_t ownerId);
    std::optional<kanban::models::Board> update(int64_t id, const BoardUpdate& changes);
    bool remove(int64_t id);

private:
    kanban::db::Database& db_;
};

}
