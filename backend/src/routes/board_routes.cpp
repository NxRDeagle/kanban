#include "board_routes.hpp"

#include <nlohmann/json.hpp>
#include <optional>
#include <vector>

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

void registerBoardRoutes(
    crow::SimpleApp& app,
    kanban::repositories::BoardRepository& boardRepository,
    kanban::repositories::ColumnRepository& columnRepository,
    kanban::repositories::TaskRepository& taskRepository,
    kanban::auth::TokenService& tokens) {
    CROW_ROUTE(app, "/api/boards").methods(crow::HTTPMethod::GET)
    ([&boardRepository, &tokens](const crow::request& req) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }

        nlohmann::json arr = nlohmann::json::array();
        for (const auto& board : boardRepository.getAllByOwner(*userId)) {
            arr.push_back(kanban::models::to_json(board));
        }
        return jsonResponse(200, arr);
    });

    CROW_ROUTE(app, "/api/boards").methods(crow::HTTPMethod::POST)
    ([&boardRepository, &tokens](const crow::request& req) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }

        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("title") || !body["title"].is_string()) {
            return errorResponse(400, "title is required");
        }

        std::optional<std::string> description;
        if (body.contains("description") && body["description"].is_string()) {
            description = body["description"].get<std::string>();
        }

        auto board = boardRepository.create(*userId, body["title"].get<std::string>(), description);
        return jsonResponse(201, kanban::models::to_json(board));
    });

    CROW_ROUTE(app, "/api/boards/reorder").methods(crow::HTTPMethod::POST)
    ([&boardRepository, &tokens](const crow::request& req) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }

        auto body = nlohmann::json::parse(req.body, nullptr, false);
        if (body.is_discarded() || !body.contains("orderedBoardIds") || !body["orderedBoardIds"].is_array()) {
            return errorResponse(400, "orderedBoardIds is required");
        }

        std::vector<int64_t> orderedIds;
        for (const auto& value : body["orderedBoardIds"]) {
            if (!value.is_number_integer() && !value.is_number_unsigned()) {
                return errorResponse(400, "orderedBoardIds must be an array of integers");
            }
            orderedIds.push_back(value.get<int64_t>());
        }

        if (!boardRepository.reorder(*userId, orderedIds)) {
            return errorResponse(400, "orderedBoardIds must match all of your boards");
        }

        nlohmann::json arr = nlohmann::json::array();
        for (const auto& board : boardRepository.getAllByOwner(*userId)) {
            arr.push_back(kanban::models::to_json(board));
        }
        return jsonResponse(200, arr);
    });

    CROW_ROUTE(app, "/api/boards/<int>").methods(crow::HTTPMethod::GET)
    ([&boardRepository, &columnRepository, &taskRepository, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }

        auto board = boardRepository.getById(id);
        if (!board.has_value() || board->ownerId != *userId) {
            return errorResponse(404, "Board not found");
        }

        auto body = kanban::models::to_json(*board);
        nlohmann::json columnsJson = nlohmann::json::array();
        for (const auto& column : columnRepository.getByBoardId(id)) {
            auto columnJson = kanban::models::to_json(column);
            nlohmann::json tasksJson = nlohmann::json::array();
            for (const auto& task : taskRepository.getByColumnId(column.id)) {
                tasksJson.push_back(kanban::models::to_json(task));
            }
            columnJson["tasks"] = tasksJson;
            columnsJson.push_back(columnJson);
        }
        body["columns"] = columnsJson;
        return jsonResponse(200, body);
    });

    CROW_ROUTE(app, "/api/boards/<int>").methods(crow::HTTPMethod::PATCH)
    ([&boardRepository, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }

        auto existing = boardRepository.getById(id);
        if (!existing.has_value() || existing->ownerId != *userId) {
            return errorResponse(404, "Board not found");
        }

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

        auto board = boardRepository.update(id, changes);
        if (!board.has_value()) {
            return errorResponse(404, "Board not found");
        }
        return jsonResponse(200, kanban::models::to_json(*board));
    });

    CROW_ROUTE(app, "/api/boards/<int>").methods(crow::HTTPMethod::DELETE)
    ([&boardRepository, &tokens](const crow::request& req, int64_t id) {
        auto userId = tokens.userIdFrom(req);
        if (!userId.has_value()) {
            return errorResponse(401, "Unauthorized");
        }

        auto existing = boardRepository.getById(id);
        if (!existing.has_value() || existing->ownerId != *userId) {
            return errorResponse(404, "Board not found");
        }
        boardRepository.remove(id);
        return crow::response(204);
    });
}

}
