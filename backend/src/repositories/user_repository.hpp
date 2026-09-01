#pragma once

#include "../db/database.hpp"
#include "../models/user.hpp"

#include <optional>
#include <string>

namespace kanban::repositories {

class UserRepository {
public:
    explicit UserRepository(kanban::db::Database& database);

    kanban::models::User create(
        const std::string& email,
        const std::string& username,
        const std::string& passwordHash);
    std::optional<kanban::models::User> getById(int64_t id);
    std::optional<kanban::models::User> getByEmail(const std::string& email);
    std::optional<kanban::models::User> getByUsername(const std::string& username);

private:
    kanban::db::Database& db_;
};

}
