package com.acadschedule.scheduler.controller;

import com.acadschedule.scheduler.entity.Constraint;
import com.acadschedule.scheduler.repository.ConstraintRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/constraints")
@CrossOrigin(origins = "*")
public class ConstraintController {

    private final ConstraintRepository repository;

    public ConstraintController(ConstraintRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Constraint> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public Constraint create(@RequestBody Constraint constraint) {
        return repository.save(constraint);
    }

    @PatchMapping("/{id}/toggle")
    public void toggleActive(@PathVariable String id) {
        Constraint c = repository.findById(id).orElseThrow();
        c.setActive(!c.isActive());
        repository.save(c);
    }
}