package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Constraint;
import com.acadschedule.scheduler.service.ConstraintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/constraints")
public class ConstraintController {

    private final ConstraintService constraintService;

    public ConstraintController(ConstraintService constraintService) {
        this.constraintService = constraintService;
    }

    @GetMapping
    public List<Constraint> getAllConstraints() {
        return constraintService.getAllConstraints();
    }

    @PostMapping
    public Constraint createConstraint(@RequestBody Constraint constraint) {
        return constraintService.createConstraint(constraint);
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Void> toggleConstraintStatus(@PathVariable String id) {
        constraintService.toggleConstraintStatus(id);
        return ResponseEntity.ok().build();
    }
}
