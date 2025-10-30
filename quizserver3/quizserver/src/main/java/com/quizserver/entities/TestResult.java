package com.quizserver.entities;

import com.quizserver.dto.TestResultDTO;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    private Long id;

    private int totalQuestions;

    private int correctAnswers;

    private double percentage;

    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;  

    public TestResultDTO getDto(){
        TestResultDTO dto = new TestResultDTO();

        dto.setId(id);
        dto.setTotalQuestions(totalQuestions);
        dto.setCorrectAnswers(correctAnswers);
        dto.setPercentage(percentage);
        dto.setTestName(test != null ? test.getTitle() : "Unknown Test");
        dto.setUserName(user != null ? user.getName() : "Unknown User");
        dto.setTestId(test != null ? test.getId() : null);
        dto.setUserId(user != null ? user.getId() : null);

        return dto;
    }

}
