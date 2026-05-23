package com.b2b.ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

	@Bean
	public CorsFilter corsFilter() {
		CorsConfiguration config = new CorsConfiguration();

		// Allow all local dev origins
		config.setAllowedOrigins(List.of(
				"http://localhost:5173",
				"http://localhost:5174",
				"http://localhost:3000",
				"http://127.0.0.1:5173",
				"http://127.0.0.1:5174"
		));

		// Allow all standard + custom headers used by FE
		config.setAllowedHeaders(List.of(
				"Origin", "Content-Type", "Accept", "Authorization",
				"X-Admin-Id", "X-Admin-Name", "X-User-Id", "X-Requested-With", "Cache-Control"
		));

		// Allow all HTTP methods
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));

		config.setAllowCredentials(true);
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return new CorsFilter(source);
	}
}
