#pragma once

#include "crow.h"
#include "../repositories/board_repository.hpp"
#include "../repositories/column_repository.hpp"
#include "../repositories/task_repository.hpp"

namespace kanban::routes {

void registerBoardRoutes(
    crow::SimpleApp& app,
    kanban::repositories::BoardRepository& boardRepository,
    kanban::repositories::ColumnRepository& columnRepository,
    kanban::repositories::TaskRepository& taskRepository);

}
