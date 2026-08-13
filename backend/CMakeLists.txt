cmake_minimum_required(VERSION 3.21)
project(kanban_backend CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Crow CONFIG REQUIRED)
find_package(SQLiteCpp CONFIG REQUIRED)
find_package(nlohmann_json CONFIG REQUIRED)

file(READ ${CMAKE_SOURCE_DIR}/src/db/migrations/0001_init.sql INIT_SQL_CONTENT)
configure_file(
    ${CMAKE_SOURCE_DIR}/src/db/embedded_schema.hpp.in
    ${CMAKE_BINARY_DIR}/generated/embedded_schema.hpp
    @ONLY
)

add_executable(kanban_server
    src/main.cpp
    src/db/database.cpp
    src/repositories/board_repository.cpp
    src/routes/board_routes.cpp
)
target_include_directories(kanban_server PRIVATE ${CMAKE_BINARY_DIR}/generated src)
target_link_libraries(kanban_server PRIVATE Crow::Crow SQLiteCpp nlohmann_json::nlohmann_json)
target_compile_definitions(kanban_server PRIVATE _WIN32_WINNT=0x0A00)
