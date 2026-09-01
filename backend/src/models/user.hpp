#pragma once

#include <nlohmann/json.hpp>
#include <string>

namespace kanban::models {

struct User {
    int64_t id = 0;
    std::string email;
    std::string username;
    std::string passwordHash;
    std::string createdAt;
    std::string updatedAt;
};

inline nlohmann::json to_json(const User& user) {
    return nlohmann::json{
        {"id", user.id},
        {"email", user.email},
        {"username", user.username},
        {"createdAt", user.createdAt},
        {"updatedAt", user.updatedAt},
    };
}

}
