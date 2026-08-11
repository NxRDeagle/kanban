cmake_minimum_required(VERSION 3.21)
project(kanban_backend CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(Crow CONFIG REQUIRED)

add_executable(kanban_server src/main.cpp)
target_link_libraries(kanban_server PRIVATE Crow::Crow)
target_compile_definitions(kanban_server PRIVATE _WIN32_WINNT=0x0A00)
