package com.acadschedule.scheduler.repository;

import com.acadschedule.scheduler.entity.UserOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserOtpRepository extends JpaRepository<UserOtp, Long> {
    Optional<UserOtp> findByPreAuthToken(String preAuthToken);

    void deleteByPreAuthToken(String preAuthToken);

    void deleteByEmail(String email); // Clean up old OTPs
}
