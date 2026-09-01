#include "crow.h"
#include "auth/token_service.hpp"
#include "db/database.hpp"
#include "repositories/board_repository.hpp"
#include "repositories/column_repository.hpp"
#include "repositories/task_repository.hpp"
#include "repositories/user_repository.hpp"
#include "routes/auth_routes.hpp"
#include "routes/board_routes.hpp"
#include "routes/column_routes.hpp"
#include "routes/task_routes.hpp"

#include <cstdlib>
#include <string>

namespace {

std::string jwtSecretFromEnv() {
    if (const char* fromEnv = std::getenv("KANBAN_JWT_SECRET")) {
        return fromEnv;
    }
    return "KANBAN_DEV_SECRET";
}
}

int main() {
    kanban::db::Database database("kanban.db");
    kanban::repositories::UserRepository userRepository(database);
    kanban::repositories::BoardRepository boardRepository(database);
    kanban::repositories::ColumnRepository columnRepository(database);
    kanban::repositories::TaskRepository taskRepository(database);
    kanban::auth::TokenService tokens(jwtSecretFromEnv());

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/health")
    ([]() {
        crow::json::wvalue body;
        body["status"] = "ok";
        return body;
    });

    kanban::routes::registerAuthRoutes(app, userRepository, tokens);
    kanban::routes::registerBoardRoutes(app, boardRepository, columnRepository, taskRepository, tokens);
    kanban::routes::registerColumnRoutes(app, columnRepository, boardRepository, tokens);
    kanban::routes::registerTaskRoutes(app, taskRepository, tokens);

    std::cout << "Kanban backend listening on http://localhost:8080\n";
    app.port(8080).multithreaded().run();
}
