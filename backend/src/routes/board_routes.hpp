#pragma once

#include "crow.h"
#include "../repositories/board_repository.hpp"

namespace kanban::routes {

void registerBoardRoutes(crow::SimpleApp& app, kanban::repositories::BoardRepository& repository);

}
