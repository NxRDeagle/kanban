#pragma once

#include <nlohmann/json.hpp>
#include <optional>
#include <string>

namespace kanban::models {

struct Board {
    int64_t id = 0;
    int64_t ownerId = 0;
    std::string title;
    std::optional<std::string> description;
    std::string createdAt;
    std::string updatedAt;
};

inline nlohmann::json to_json(const Board& board) {
    return nlohmann::json{
        {"id", board.id},
        {"ownerId", board.ownerId},
        {"title", board.title},
        {"description", board.description.has_value() ? nlohmann::json(*board.description) : nlohmann::json(nullptr)},
        {"createdAt", board.createdAt},
        {"updatedAt", board.updatedAt},
    };
}

}
