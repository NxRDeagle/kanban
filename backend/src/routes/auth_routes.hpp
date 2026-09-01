#pragma once

#include "crow.h"
#include "../auth/token_service.hpp"
#include "../repositories/user_repository.hpp"

namespace kanban::routes {

void registerAuthRoutes(
    crow::SimpleApp& app,
    kanban::repositories::UserRepository& users,
    kanban::auth::TokenService& tokens);

}
