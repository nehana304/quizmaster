package com.quizserver.dto;

import lombok.Data;

@Data
public class QuestionDTO {

    private Long id;

    private String content;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;

    private String correctOption;

    private Long testId;
    
}
