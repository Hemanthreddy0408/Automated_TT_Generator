FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app

# Change these two lines to include the full path
COPY Automated-Timetable-Scheduling-and-Faculty-Workload-Optimization-System/backend/scheduler/pom.xml .
COPY Automated-Timetable-Scheduling-and-Faculty-Workload-Optimization-System/backend/scheduler/src ./src

RUN mvn clean package -DskipTests

FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]