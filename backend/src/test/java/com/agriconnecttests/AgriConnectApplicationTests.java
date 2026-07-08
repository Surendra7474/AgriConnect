package com.agriconnecttests;

import com.agriconnect.AgriConnectApplication;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

@SpringBootTest(
    classes = AgriConnectApplication.class,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:agriconnect;MODE=MySQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.autoconfigure.exclude=org.springframework.boot.jackson.autoconfigure.JacksonAutoConfiguration"
    }
)
@Import(AgriConnectApplicationTests.TestBeans.class)
class AgriConnectApplicationTests {

    @Test
    void contextLoads() {
    }

    @TestConfiguration
    static class TestBeans {

        @Bean
        ObjectMapper objectMapper() {
            return new ObjectMapper();
        }
    }
}