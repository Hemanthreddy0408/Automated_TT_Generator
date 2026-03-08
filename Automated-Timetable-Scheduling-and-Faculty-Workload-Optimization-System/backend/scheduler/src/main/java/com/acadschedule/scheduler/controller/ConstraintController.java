package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Constraint;
import com.acadschedule.scheduler.repository.ConstraintRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/constraints")
public class ConstraintController {

    private final ConstraintRepository repo;

    public ConstraintController(ConstraintRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Constraint> getConstraints() {
        return repo.findAll();
    }

    @PostMapping
    public Constraint createConstraint(@RequestBody Constraint constraint) {
        return repo.save(constraint);
    }
}
