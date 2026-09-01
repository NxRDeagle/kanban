#pragma once

#include "crow.h"
#include "../auth/token_service.hpp"
#include "../repositories/board_repository.hpp"
#include "../repositories/column_repository.hpp"

namespace kanban::routes {

void registerColumnRoutes(
    crow::SimpleApp& app,
    kanban::repositories::ColumnRepository& columns,
    kanban::repositories::BoardRepository& boards,
    kanban::auth::TokenService& tokens);

}
