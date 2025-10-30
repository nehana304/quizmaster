
package com.quizserver.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quizserver.entities.Test;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {
    
    Optional<Test> findByTestCode(String testCode);

} 