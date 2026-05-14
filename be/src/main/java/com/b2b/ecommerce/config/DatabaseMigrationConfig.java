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
		return () -> Flyway.configure()
				.dataSource(dataSource)
				.locations("classpath:db/migration")
				.baselineOnMigrate(true)
				.validateOnMigrate(true)
				.load()
				.migrate();
	}
}
