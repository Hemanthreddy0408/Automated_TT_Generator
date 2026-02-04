package com.acadschedule.scheduler.service;

import com.acadschedule.scheduler.entity.Section;
import com.acadschedule.scheduler.repository.SectionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SectionService {

    private final SectionRepository repository;

    public SectionService(SectionRepository repository) {
        this.repository = repository;
    }

    public List<Section> getAll() {
        return repository.findAll();
    }

    public Section create(Section section) {
        return repository.save(section);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }
}
