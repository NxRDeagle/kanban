#include "auth_routes.hpp"

#include "../auth/password.hpp"
#include "../models/user.hpp"

#include <nlohmann/json.hpp>
#include <cctype>

namespace kanban::routes {

namespace {

crow::response jsonResponse(int status, const nlohmann::json& body) {
    crow::response res(status, body.dump());
    res.set_header("Content-Type", "application/json");
    return res;
}

crow::response errorResponse(int status, const std::string& message) {
    return jsonResponse(status, nlohmann::json{{"error", message}});
}

bool isValidEmail(const std::string& email) {
    const auto at = email.find('@');
    if (at == std::string::npos || at == 0) {
        return false;
    }
    const auto dot = email.find('.', at + 1);
    return dot != std::string::npos && dot + 1 < email.size();
}

bool isValidUsername(const std::string& username) {
    if (username.size() < 3 || username.size() > 32) {
        return false;
    }
    for (unsigned char ch : username) {
        if (!std::isalnum(ch) && ch != '_') {
            return false;
        }
    }
    return true;
}

nlohmann::json authBody(const kanban::models::User& user, const std::string& token) {
    return nlohmann::json{
        {"token", token},
        {"user", kanban::models::to_json(user)},
    };
}

}

void registerAuthRoutes(
    crow::SimpleApp& app,
    kanban::repositories::UserRepository& users,
    kanban::auth::TokenService& tokens) {
    CROW_ROUTE(app, "/api/auth/register").methods(crow::HTTPMethod::POST)
    ([&users, &tokens](const crow::request& req) {
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()
            || !body.contains("email") || !body["email"].is_string()
            || !body.contains("username") || !body["username"].is_string()
            || !body.contains("password") || !body["password"].is_string()) {
            return errorResponse(400, "email, username and password are required");
        }

        const auto email = body["email"].get<std::string>();
        const auto username = body["username"].get<std::string>();
        const auto password = body["password"].get<std::string>();

        if (!isValidEmail(email)) {
            return errorResponse(400, "invalid email");
        }
        if (!isValidUsername(username)) {
            return errorResponse(400, "username must be 3-32 letters, digits or underscore");
        }
        if (password.size() < 8) {
            return errorResponse(400, "password must be at least 8 characters");
        }
        if (users.getByEmail(email).has_value()) {
            return errorResponse(409, "email is already taken");
        }
        if (users.getByUsername(username).has_value()) {
            return errorResponse(409, "username is already taken");
        }

        auto user = users.create(email, username, kanban::auth::hashPassword(password));
        return jsonResponse(201, authBody(user, tokens.issue(user.id)));
    });

    CROW_ROUTE(app, "/api/auth/login").methods(crow::HTTPMethod::POST)
    ([&users, &tokens](const crow::request& req) {
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()
            || !body.contains("email") || !body["email"].is_string()
            || !body.contains("password") || !body["password"].is_string()) {
            return errorResponse(400, "email and password are required");
        }

        auto user = users.getByEmail(body["email"].get<std::string>());
        if (!user.has_value()
            || !kanban::auth::verifyPassword(user->passwordHash, body["password"].get<std::string>())) {
            return errorResponse(401, "invalid email or password");
        }

        return jsonResponse(200, authBody(*user, tokens.issue(user->id)));
    });

    CROW_ROUTE(app, "/api/auth/me").methods(crow::HTTPMethod::GET)
    ([&users, &tokens](const crow::request& req) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }

        auto user = users.getById(*userId);
        if (!user.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        return jsonResponse(200, kanban::models::to_json(*user));
    });
}

}
