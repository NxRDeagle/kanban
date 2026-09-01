#pragma once

#include <string>

namespace kanban::auth {

std::string hashPassword(const std::string& password);
bool verifyPassword(const std::string& hash, const std::string& password);

}
