#include "database.hpp"
#include "embedded_schema.hpp"

#include <iostream>

namespace kanban::db {

Database::Database(const std::string& path)
    : db_(path, SQLite::OPEN_READWRITE | SQLite::OPEN_CREATE) {
    db_.exec("PRAGMA foreign_keys = ON;");
    runMigrations();
}

SQLite::Database& Database::handle() {
    return db_;
}

void Database::runMigrations() {
    db_.exec(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        "  version INTEGER PRIMARY KEY,"
        "  applied_at TEXT NOT NULL"
        ");");

    SQLite::Statement checkStmt(db_, "SELECT COUNT(*) FROM schema_migrations WHERE version = 1;");
    checkStmt.executeStep();
    const bool alreadyApplied = checkStmt.getColumn(0).getInt() > 0;

    if (!alreadyApplied) {
        SQLite::Transaction transaction(db_);
        db_.exec(kInitSql);
        SQLite::Statement insertStmt(
            db_, "INSERT INTO schema_migrations (version, applied_at) VALUES (1, datetime('now'));");
        insertStmt.exec();
        transaction.commit();
        std::cout << "Migration 0001_init applied.\n";
    } else {
        std::cout << "Migration 0001_init already applied.\n";
    }

    SQLite::Statement tablesStmt(
        db_, "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name;");
    std::cout << "Tables in database: ";
    bool first = true;
    while (tablesStmt.executeStep()) {
        if (!first) std::cout << ", ";
        std::cout << tablesStmt.getColumn(0).getString();
        first = false;
    }
    std::cout << "\n";
}

}