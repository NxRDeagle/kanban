#pragma once

#include "crow.h"
#include "../repositories/task_repository.hpp"

namespace kanban::routes {

void registerTaskRoutes(crow::SimpleApp& app, kanban::repositories::TaskRepository& repository);

}
