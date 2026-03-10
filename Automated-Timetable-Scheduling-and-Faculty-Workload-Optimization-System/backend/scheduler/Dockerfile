FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
# Copy the pom.xml from the scheduler folder
COPY pom.xml .
# Copy the src folder
COPY src ./src
# Build the application
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java","-jar","app.jar"]
