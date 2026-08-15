#pragma once

#include "crow.h"
#include "../repositories/column_repository.hpp"

namespace kanban::routes {

void registerColumnRoutes(crow::SimpleApp& app, kanban::repositories::ColumnRepository& repository);

}
