#include "token_service.hpp"

#include <jwt-cpp/traits/nlohmann-json/defaults.h>

#include <chrono>
#include <string>

namespace kanban::auth {

namespace {

constexpr auto kIssuer = "kanban";
constexpr auto kTokenTtl = std::chrono::hours(24 * 7);

}

TokenService::TokenService(std::string secret) : secret_(std::move(secret)) {}

std::string TokenService::issue(int64_t userId) const {
    const auto now = std::chrono::system_clock::now();
    return jwt::create()
        .set_issuer(kIssuer)
        .set_type("JWT")
        .set_subject(std::to_string(userId))
        .set_issued_at(now)
        .set_expires_at(now + kTokenTtl)
        .sign(jwt::algorithm::hs256{secret_});
}

std::optional<int64_t> TokenService::verify(const std::string& token) const {
    try {
        auto decoded = jwt::decode(token);
        jwt::verify()
            .allow_algorithm(jwt::algorithm::hs256{secret_})
            .with_issuer(kIssuer)
            .verify(decoded);
        return std::stoll(decoded.get_subject());
    } catch (...) {
        return std::nullopt;
    }
}

std::optional<int64_t> TokenService::userIdFrom(const crow::request& req) const {
    const auto header = req.get_header_value("Authorization");
    const std::string prefix = "Bearer ";
    if (header.size() <= prefix.size() || header.compare(0, prefix.size(), prefix) != 0) {
        return std::nullopt;
    }
    return verify(header.substr(prefix.size()));
}

}
