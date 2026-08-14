#include "board_routes.hpp"

#include <nlohmann/json.hpp>

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

}

void registerBoardRoutes(crow::SimpleApp& app, kanban::repositories::BoardRepository& repository) {
    CROW_ROUTE(app, "/api/boards").methods(crow::HTTPMethod::GET)
    ([&repository]() {
        nlohmann::json arr = nlohmann::json::array();
        for (const auto& board : repository.getAll()) {
            arr.push_back(kanban::models::to_json(board));
        }
        return jsonResponse(200, arr);
    });

    CROW_ROUTE(app, "/api/boards").methods(crow::HTTPMethod::POST)
    ([&repository](const crow::request& req) {
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("title") || !body["title"].is_string()) {
            return errorResponse(400, "title is required");
        }

        std::optional<std::string> description;
        if (body.contains("description") && body["description"].is_string()) {
            description = body["description"].get<std::string>();
        }

        auto board = repository.create(body["title"].get<std::string>(), description);
        return jsonResponse(201, kanban::models::to_json(board));
    });

    CROW_ROUTE(app, "/api/boards/<int>").methods(crow::HTTPMethod::GET)
    ([&repository](int64_t id) {
        auto board = repository.getById(id);
        if (!board.has_value()) {
            return errorResponse(404, "Board not found");
        }
        return jsonResponse(200, kanban::models::to_json(*board));
    });

    CROW_ROUTE(app, "/api/boards/<int>").methods(crow::HTTPMethod::PATCH)
    ([&repository](const crow::request& req, int64_t id) {
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()) {
            return errorResponse(400, "invalid JSON body");
        }

        kanban::repositories::BoardUpdate changes;
        if (body.contains("title")) {
            if (!body["title"].is_string()) {
                return errorResponse(400, "title must be a string");
            }
            changes.title = body["title"].get<std::string>();
        }
        if (body.contains("description")) {
            if (body["description"].is_null()) {
                changes.description = std::optional<std::string>(std::nullopt);
            } else if (body["description"].is_string()) {
                changes.description = std::optional<std::string>(body["description"].get<std::string>());
            } else {
                return errorResponse(400, "description must be a string or null");
            }
        }

        auto board = repository.update(id, changes);
        if (!board.has_value()) {
            return errorResponse(404, "Board not found");
        }
        return jsonResponse(200, kanban::models::to_json(*board));
    });
}

}
