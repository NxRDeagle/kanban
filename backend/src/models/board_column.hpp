#pragma once

#include <nlohmann/json.hpp>
#include <string>

namespace kanban::models {

struct BoardColumn {
    int64_t id = 0;
    int64_t boardId = 0;
    std::string title;
    int position = 0;
    std::string createdAt;
    std::string updatedAt;
};

inline nlohmann::json to_json(const BoardColumn& column) {
    return nlohmann::json{
        {"id", column.id},
        {"boardId", column.boardId},
        {"title", column.title},
        {"position", column.position},
        {"createdAt", column.createdAt},
        {"updatedAt", column.updatedAt},
    };
}

}
