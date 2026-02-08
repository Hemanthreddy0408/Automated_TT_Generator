package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Constraint;
import com.acadschedule.scheduler.repository.ConstraintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConstraintService {

    private final ConstraintRepository constraintRepository;

    public ConstraintService(ConstraintRepository constraintRepository) {
        this.constraintRepository = constraintRepository;
    }

    public List<Constraint> getAllConstraints() {
        return constraintRepository.findAll();
    }

    public Constraint createConstraint(Constraint constraint) {
        return constraintRepository.save(constraint);
    }

    public void toggleConstraintStatus(String id) {
        Constraint constraint = constraintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Constraint not found with id: " + id));
        constraint.setActive(!constraint.isActive());
        constraintRepository.save(constraint);
    }
}
