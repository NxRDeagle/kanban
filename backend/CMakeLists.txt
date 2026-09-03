cmake_minimum_required(VERSION 3.21)
project(kanban_backend CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Crow CONFIG REQUIRED)
find_package(SQLiteCpp CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)
find_package(jwt-cpp CONFIG REQUIRED)
find_package(unofficial-sodium CONFIG REQUIRED)

file(READ ${CMAKE_SOURCE_DIR}/src/db/migrations/0001_init.sql INIT_SQL_CONTENT)
file(READ ${CMAKE_SOURCE_DIR}/src/db/migrations/0002_board_position.sql MIGRATION_0002_SQL)
configure_file(
    ${CMAKE_SOURCE_DIR}/src/db/embedded_schema.hpp.in
    ${CMAKE_BINARY_DIR}/generated/embedded_schema.hpp
    @ONLY
)

add_executable(kanban_server
    src/main.cpp
    src/auth/password.cpp
    src/auth/token_service.cpp
    src/db/database.cpp
    src/repositories/board_repository.cpp
    src/repositories/column_repository.cpp
    src/repositories/task_repository.cpp
    src/repositories/user_repository.cpp
    src/routes/auth_routes.cpp
    src/routes/board_routes.cpp
    src/routes/column_routes.cpp
    src/routes/task_routes.cpp
)
target_include_directories(kanban_server PRIVATE ${CMAKE_BINARY_DIR}/generated src)
target_link_libraries(kanban_server PRIVATE
    Crow::Crow
    SQLiteCpp
    nlohmann_json::nlohmann_json
    jwt-cpp::jwt-cpp
    unofficial-sodium::sodium
)
target_compile_definitions(kanban_server PRIVATE _WIN32_WINNT=0x0A00)
