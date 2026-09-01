#include "password.hpp"

#include <sodium.h>
#include <stdexcept>

namespace kanban::auth {

std::string hashPassword(const std::string& password) {
    if (sodium_init() < 0) {
        throw std::runtime_error("sodium_init failed");
    }

    char hash[crypto_pwhash_STRBYTES];
    if (crypto_pwhash_str(
            hash,
            password.c_str(),
            password.size(),
            crypto_pwhash_OPSLIMIT_INTERACTIVE,
            crypto_pwhash_MEMLIMIT_INTERACTIVE) != 0) {
        throw std::runtime_error("password hashing failed");
    }
    return std::string(hash);
}

bool verifyPassword(const std::string& hash, const std::string& password) {
    if (sodium_init() < 0) {
        return false;
    }
    return crypto_pwhash_str_verify(hash.c_str(), password.c_str(), password.size()) == 0;
}

}
