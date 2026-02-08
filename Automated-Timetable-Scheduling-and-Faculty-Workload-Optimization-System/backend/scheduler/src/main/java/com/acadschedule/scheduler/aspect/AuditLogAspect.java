package com.acadschedule.scheduler.aspect;

import com.acadschedule.scheduler.service.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import org.springframework.context.annotation.Lazy;
import java.util.Arrays;


@Aspect
@Component
public class AuditLogAspect {

    private final AuditLogService auditLogService;

    @Autowired
    public AuditLogAspect(@Lazy AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }


    // Pointcut for services we want to monitor
    @Pointcut("execution(* com.acadschedule.scheduler.service.FacultyService.*(..)) || " +
              "execution(* com.acadschedule.scheduler.service.SectionService.*(..)) || " +
              "execution(* com.acadschedule.scheduler.service.RoomService.*(..)) || " +
              "execution(* com.acadschedule.scheduler.service.LeaveService.*(..)) || " +
              "execution(* com.acadschedule.scheduler.service.SubjectService.*(..)) || " +
              "execution(* com.acadschedule.scheduler.service.ConstraintService.*(..))")
    public void monitorServices() {}

    @AfterReturning(pointcut = "monitorServices()", returning = "result")
    public void logServiceActivity(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();

        // ❌ prevent recursion when fetching logs
        if (methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list")) {
            return;
        }

        // ❌ prevent logging AuditLogService itself
        if (joinPoint.getTarget().getClass().getSimpleName().equals("AuditLogService")) {
            return;
        }

        String className = joinPoint.getTarget().getClass().getSimpleName();
        Object[] args = joinPoint.getArgs();

        // Determine action type
        String actionType = null;
        if (methodName.startsWith("create") || methodName.startsWith("add") || methodName.startsWith("save")) {
            actionType = "CREATE";
        } else if (methodName.startsWith("update") || methodName.startsWith("edit") || methodName.startsWith("approve") || methodName.startsWith("reject")) {
            actionType = "UPDATE";
        } else if (methodName.startsWith("delete") || methodName.startsWith("remove")) {
            actionType = "DELETE";
        }

        // If not a modification action, ignore (e.g., get, find, list)
        if (actionType == null) {
            return;
        }

        // Determine entity type from class name (e.g., FacultyService -> FACULTY)
        String entityType = className.replace("Service", "").toUpperCase();

        // Construct description
        StringBuilder description = new StringBuilder();
        description.append(actionType).append(" ").append(entityType);
        
        if (args.length > 0) {
            description.append(" - Args: ");
            for (Object arg : args) {
                if (arg != null) {
                    // Avoid logging huge objects or sensitive data, simplified string representation
                     String argStr = arg.toString();
                     if (argStr.length() > 100) argStr = argStr.substring(0, 100) + "...";
                     description.append(argStr).append("; ");
                }
            }
        }

        // Get current user
        String user = "System/Admin";
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
                user = auth.getName();
            }
        } catch (Exception e) {
            // Ignore security context errors
        }

        // Log the action
        auditLogService.logAction(entityType, actionType, description.toString(), user);
    }
}
