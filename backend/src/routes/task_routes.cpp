#include "task_routes.hpp"

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

void registerTaskRoutes(
    crow::SimpleApp& app,
    kanban::repositories::TaskRepository& repository,
    kanban::auth::TokenService& tokens) {
    CROW_ROUTE(app, "/api/columns/<int>/tasks").methods(crow::HTTPMethod::POST)
    ([&repository, &tokens](const crow::request& req, int64_t columnId) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        if (!repository.columnOwnedByUser(columnId, *userId)) {
            return errorResponse(404, "Column not found");
        }

        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("title") || !body["title"].is_string()) {
            return errorResponse(400, "title is required");
        }

        std::optional<std::string> description;
        if (body.contains("description") && body["description"].is_string()) {
            description = body["description"].get<std::string>();
        }

        auto task = repository.create(columnId, body["title"].get<std::string>(), description);
        if (!task.has_value()) {
            return errorResponse(404, "Column not found");
        }
        return jsonResponse(201, kanban::models::to_json(*task));
    });

    CROW_ROUTE(app, "/api/tasks/<int>").methods(crow::HTTPMethod::PATCH)
    ([&repository, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        if (!repository.ownedByUser(id, *userId)) {
            return errorResponse(404, "Task not found");
        }

        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()) {
            return errorResponse(400, "invalid JSON body");
        }

        kanban::repositories::TaskUpdate changes;
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

        auto task = repository.update(id, changes);
        if (!task.has_value()) {
            return errorResponse(404, "Task not found");
        }
        return jsonResponse(200, kanban::models::to_json(*task));
    });

    CROW_ROUTE(app, "/api/tasks/<int>").methods(crow::HTTPMethod::DELETE)
    ([&repository, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        if (!repository.ownedByUser(id, *userId)) {
            return errorResponse(404, "Task not found");
        }
        repository.remove(id);
        return crow::response(204);
    });

    CROW_ROUTE(app, "/api/tasks/<int>/move").methods(crow::HTTPMethod::POST)
    ([&repository, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }
        if (!repository.ownedByUser(id, *userId)) {
            return errorResponse(404, "Task not found");
        }

        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded()
            || !body.contains("toColumnId") || !body["toColumnId"].is_number_integer()
            || !body.contains("toPosition") || !body["toPosition"].is_number_integer()) {
            return errorResponse(400, "toColumnId and toPosition are required");
        }

        const auto toColumnId = body["toColumnId"].get<int64_t>();
        if (!repository.columnOwnedByUser(toColumnId, *userId)) {
            return errorResponse(404, "Column not found");
        }

        auto task = repository.move(id, toColumnId, body["toPosition"].get<int>());
        if (!task.has_value()) {
            return errorResponse(404, "Column not found");
        }
        return jsonResponse(200, kanban::models::to_json(*task));
    });
}

}
