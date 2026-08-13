#include "crow.h"
#include "db/database.hpp"
#include "repositories/board_repository.hpp"
#include "routes/board_routes.hpp"

int main() {
    kanban::db::Database database("kanban.db");
    kanban::repositories::BoardRepository boardRepository(database);

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/health")
    ([]() {
        crow::json::wvalue body;
        body["status"] = "ok";
        return body;
    });

    kanban::routes::registerBoardRoutes(app, boardRepository);

    std::cout << "Kanban backend listening on http://localhost:8080\n";
    app.port(8080).multithreaded().run();
}
