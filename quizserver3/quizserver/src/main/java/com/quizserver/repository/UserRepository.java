package com.quizserver.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quizserver.entities.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Find user by email (used for login and validation)
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);

    // Check if a user already exists with this email
    boolean existsByEmail(String email);
}
