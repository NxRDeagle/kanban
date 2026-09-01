#pragma once

#include "crow.h"

#include <optional>
#include <string>

namespace kanban::auth {

class TokenService {
public:
    explicit TokenService(std::string secret);

    std::string issue(int64_t userId) const;
    std::optional<int64_t> verify(const std::string& token) const;
    std::optional<int64_t> userIdFrom(const crow::request& req) const;

private:
    std::string secret_;
};

}
