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

		// Allow local dev origins. Patterns keep credentials enabled while supporting Vite port changes.
		config.setAllowedOriginPatterns(List.of(
				"http://localhost:*",
				"http://127.0.0.1:*"
		));

		// Allow all standard + custom headers used by FE
		config.setAllowedHeaders(List.of(
				"Origin", "Content-Type", "Accept", "Authorization",
				"X-Admin-Id", "X-Admin-Name",
				"X-User-Id", "X-User-Name", "X-User-Email", "X-User-Phone",
				"X-Requested-With", "Cache-Control"
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
