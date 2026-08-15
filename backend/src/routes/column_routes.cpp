#include "column_routes.hpp"

#include <nlohmann/json.hpp>

// Переопределение макроса от винды, тк он ломает crow::HTTPMethod::DELETE.
#ifdef DELETE
#undef DELETE
#endif

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

void registerColumnRoutes(crow::SimpleApp& app, kanban::repositories::ColumnRepository& repository) {
    CROW_ROUTE(app, "/api/boards/<int>/columns").methods(crow::HTTPMethod::POST)
    ([&repository](const crow::request& req, int64_t boardId) {
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("title") || !body["title"].is_string()) {
            return errorResponse(400, "title is required");
        }

        auto column = repository.create(boardId, body["title"].get<std::string>());
        if (!column.has_value()) {
            return errorResponse(404, "Board not found");
        }
        return jsonResponse(201, kanban::models::to_json(*column));
    });

    CROW_ROUTE(app, "/api/columns/<int>").methods(crow::HTTPMethod::PATCH)
    ([&repository](const crow::request& req, int64_t id) {
        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("title") || !body["title"].is_string()) {
            return errorResponse(400, "title is required");
        }

        auto column = repository.update(id, body["title"].get<std::string>());
        if (!column.has_value()) {
            return errorResponse(404, "Column not found");
        }
        return jsonResponse(200, kanban::models::to_json(*column));
    });

    CROW_ROUTE(app, "/api/columns/<int>").methods(crow::HTTPMethod::DELETE)
    ([&repository](int64_t id) {
        if (!repository.remove(id)) {
            return errorResponse(404, "Column not found");
        }
        return crow::response(204);
    });
}

}
