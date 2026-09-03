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

namespace {

bool hasMigration(SQLite::Database& db, int version) {
    SQLite::Statement checkStmt(db, "SELECT COUNT(*) FROM schema_migrations WHERE version = ?;");
    checkStmt.bind(1, version);
    checkStmt.executeStep();
    return checkStmt.getColumn(0).getInt() > 0;
}

void applyMigration(SQLite::Database& db, int version, const char* sql, const char* name) {
    SQLite::Transaction transaction(db);
    db.exec(sql);
    SQLite::Statement insertStmt(
        db, "INSERT INTO schema_migrations (version, applied_at) VALUES (?, datetime('now'));");
    insertStmt.bind(1, version);
    insertStmt.exec();
    transaction.commit();
    std::cout << name << " applied.\n";
}

}

void Database::runMigrations() {
    db_.exec(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        "  version INTEGER PRIMARY KEY,"
        "  applied_at TEXT NOT NULL"
        ");");

    if (!hasMigration(db_, 1)) {
        applyMigration(db_, 1, kInitSql, "Migration 0001_init");
    } else {
        std::cout << "Migration 0001_init already applied.\n";
    }

    if (!hasMigration(db_, 2)) {
        applyMigration(db_, 2, kMigration0002Sql, "Migration 0002_board_position");
    } else {
        std::cout << "Migration 0002_board_position already applied.\n";
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