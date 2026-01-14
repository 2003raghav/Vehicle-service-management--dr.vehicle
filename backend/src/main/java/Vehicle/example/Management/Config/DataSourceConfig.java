package Vehicle.example.Management.Config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource")
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl("jdbc:oracle:thin:@//localhost:1521/FREEPDB1");
        dataSource.setUsername("VEHICLE_APP");
        dataSource.setPassword("yourpassword");
        dataSource.setDriverClassName("oracle.jdbc.OracleDriver");

        // Hikari settings
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(2);
        dataSource.setConnectionTimeout(30000);
        dataSource.setIdleTimeout(300000);
        dataSource.setMaxLifetime(1200000);
        dataSource.setAutoCommit(true);

        // Important: Disable validation during startup
        dataSource.setInitializationFailTimeout(0);

        return dataSource;
    }
}