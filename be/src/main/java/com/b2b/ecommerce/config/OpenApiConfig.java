package com.b2b.ecommerce.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
		info = @Info(
				title = "CELLPHONES B2C API",
				version = "v1",
				description = "Backend API contract generated from implemented B2C endpoints"
		),
		servers = {
				@Server(url = "http://localhost:8080", description = "Local")
		}
)
public class OpenApiConfig {
}
