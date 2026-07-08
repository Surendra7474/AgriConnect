# Backend-only Dockerfile for Render deployment
# Java 21 with Eclipse Temurin
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B -q
COPY backend/src ./src
RUN mvn package -DskipTests -B -q

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S agriconnect && adduser -S agriconnect -G agriconnect
RUN apk add --no-cache wget
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN mkdir -p /app/uploads /app/config && chown -R agriconnect:agriconnect /app
EXPOSE 8080
ENV PORT=8080
ENV JAVA_OPTS="-Xms256m -Xmx512m"
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-8080}/actuator/health || exit 1
USER agriconnect
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
