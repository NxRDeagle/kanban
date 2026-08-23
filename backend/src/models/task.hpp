#pragma once

#include <nlohmann/json.hpp>
#include <optional>
#include <string>

namespace kanban::models {

struct Task {
    int64_t id = 0;
    int64_t columnId = 0;
    std::string title;
    std::optional<std::string> description;
    int position = 0;
    std::string createdAt;
    std::string updatedAt;
};

inline nlohmann::json to_json(const Task& task) {
    return nlohmann::json{
        {"id", task.id},
        {"columnId", task.columnId},
        {"title", task.title},
        {"description", task.description.has_value() ? nlohmann::json(*task.description) : nlohmann::json(nullptr)},
        {"position", task.position},
        {"createdAt", task.createdAt},
        {"updatedAt", task.updatedAt},
    };
}

}
