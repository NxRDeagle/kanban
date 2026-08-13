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
}

}
