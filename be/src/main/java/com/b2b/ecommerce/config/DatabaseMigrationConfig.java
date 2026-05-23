package com.b2b.ecommerce.config;

import javax.sql.DataSource;

import org.flywaydb.core.Flyway;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseMigrationConfig {
	@Bean
	InitializingBean flywayMigration(DataSource dataSource) {
		return () -> {
			var flyway = Flyway.configure()
					.dataSource(dataSource)
					.locations("classpath:db/migration")
					.baselineOnMigrate(true)
					.validateOnMigrate(false)  // disable strict validate so repair can fix checksums
					.load();
			// Repair: removes failed migration records + fixes checksum mismatches
			// Safe for dev; in production remove after all migrations are stable
			flyway.repair();
			flyway.migrate();
		};
	}
}
