#include "crow.h"
#include "db/database.hpp"

int main() {
    kanban::db::Database database("kanban.db");

    crow::SimpleApp app;

    CROW_ROUTE(app, "/api/health")
    ([]() {
        crow::json::wvalue body;
        body["status"] = "ok";
        return body;
    });

    std::cout << "Kanban backend listening on http://localhost:8080\n";
    app.port(8080).multithreaded().run();
}
