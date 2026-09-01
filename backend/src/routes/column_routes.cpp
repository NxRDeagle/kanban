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

void registerColumnRoutes(
    crow::SimpleApp& app,
    kanban::repositories::ColumnRepository& columns,
    kanban::repositories::BoardRepository& boards,
    kanban::auth::TokenService& tokens) {
    CROW_ROUTE(app, "/api/boards/<int>/columns").methods(crow::HTTPMethod::POST)
    ([&columns, &boards, &tokens](const crow::request& req, int64_t boardId) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        if (!boards.ownedBy(boardId, *userId)) {
            return errorResponse(404, "Board not found");
        }

        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("title") || !body["title"].is_string()) {
            return errorResponse(400, "title is required");
        }

        auto column = columns.create(boardId, body["title"].get<std::string>());
        if (!column.has_value()) {
            return errorResponse(404, "Board not found");
        }
        return jsonResponse(201, kanban::models::to_json(*column));
    });

    CROW_ROUTE(app, "/api/columns/<int>").methods(crow::HTTPMethod::PATCH)
    ([&columns, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        if (!columns.ownedByUser(id, *userId)) {
            return errorResponse(404, "Column not found");
        }

        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("title") || !body["title"].is_string()) {
            return errorResponse(400, "title is required");
        }

        auto column = columns.update(id, body["title"].get<std::string>());
        if (!column.has_value()) {
            return errorResponse(404, "Column not found");
        }
        return jsonResponse(200, kanban::models::to_json(*column));
    });

    CROW_ROUTE(app, "/api/columns/<int>").methods(crow::HTTPMethod::DELETE)
    ([&columns, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        if (!columns.ownedByUser(id, *userId)) {
            return errorResponse(404, "Column not found");
        }
        columns.remove(id);
        return crow::response(204);
    });
}

}
