#pragma once

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>

namespace kanban::db {

class Database {
public:
    explicit Database(const std::string& path);

    SQLite::Database& handle();

private:
    void runMigrations();

    SQLite::Database db_;
};

}
