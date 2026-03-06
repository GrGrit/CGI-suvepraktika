## Build stage
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Copy Gradle wrapper and build files first (for better layer caching)
COPY gradle/ gradle/
COPY gradlew build.gradle settings.gradle ./
RUN chmod +x gradlew

# Download dependencies (cached unless build files change)
RUN ./gradlew dependencies --no-daemon

# Copy source code and build
COPY src/ src/
RUN ./gradlew bootJar --no-daemon

## Run stage
FROM eclipse-temurin:25-jre AS run
WORKDIR /app

# Run as non-root user for security
RUN addgroup --system appgroup && adduser --system appuser --ingroup appgroup
USER appuser

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
