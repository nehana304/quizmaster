package com.quizserver.service.test;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.quizserver.dto.QuestionDTO;
import com.quizserver.dto.QuestionResponse;
import com.quizserver.dto.SubmitTestDTO;
import com.quizserver.dto.TestDTO;
import com.quizserver.dto.TestDetailsDTO;
import com.quizserver.dto.TestResultDTO;
import com.quizserver.entities.Question;
import com.quizserver.entities.Test;
import com.quizserver.entities.TestResult;
import com.quizserver.entities.User;
import com.quizserver.repository.QuestionRepository;
import com.quizserver.repository.TestRepository;
import com.quizserver.repository.TestResultRepository;
import com.quizserver.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class TestServiceImpl implements TestService{

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private UserRepository userRepository;

    public TestDTO createTest(TestDTO dto){
        Test test = new Test(); 
        test.setTitle(dto.getTitle());
        test.setDescription(dto.getDescription());
        test.setTime(dto.getTime());
        
        // Use the test code from the DTO if provided, otherwise generate one
        if (dto.getTestCode() != null && !dto.getTestCode().trim().isEmpty()) {
            // Check if the provided test code already exists
            if (testRepository.findByTestCode(dto.getTestCode()).isPresent()) {
                throw new RuntimeException("Test code already exists: " + dto.getTestCode());
            }
            test.setTestCode(dto.getTestCode().toUpperCase());
        } else {
            test.setTestCode(generateTestCode()); // Generate unique test code
        }
        
        return testRepository.save(test).getDto();
    }

    private String generateTestCode() {
        // Generate a 6-character alphanumeric code
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        java.util.Random random = new java.util.Random();
        
        for (int i = 0; i < 6; i++) {
            code.append(characters.charAt(random.nextInt(characters.length())));
        }
        
        // Check if code already exists, if so generate a new one
        if (testRepository.findByTestCode(code.toString()).isPresent()) {
            return generateTestCode(); // Recursive call to generate new code
        }
        
        return code.toString();
    }

    public QuestionDTO addQuestionInTest(QuestionDTO dto){
        Optional<Test> optionalTest = testRepository.findById(dto.getTestId());
        if(optionalTest.isPresent()){
            Question question = new Question();
            question.setTest(optionalTest.get());
            question.setContent(dto.getContent());
            question.setOptionA(dto.getOptionA());
            question.setOptionB(dto.getOptionB());
            question.setOptionC(dto.getOptionC());
            question.setOptionD(dto.getOptionD());
            question.setCorrectOption(dto.getCorrectOption());

            return questionRepository.save(question).getDto();
        
        }
        throw new EntityNotFoundException("Test not found "+ dto.getId());
    }

   

        public List<TestDTO> getAllTests() {
            return testRepository.findAll().stream()
                .peek(test -> {
                    // Generate test code for existing tests that don't have one
                    if (test.getTestCode() == null || test.getTestCode().isEmpty()) {
                        test.setTestCode(generateTestCode());
                        testRepository.save(test);
                    }
                    test.setTime(test.getQuestions().size() * test.getTime());
                })
                .collect(Collectors.toList())
                .stream()
                .map(Test::getDto)
                .collect(Collectors.toList());
        }

        public List<TestDTO> getAllActiveTests() {
            return testRepository.findAll().stream()
                .filter(test -> "ACTIVE".equals(test.getStatus()) || test.getStatus() == null)
                .peek(test -> {
                    // Generate test code for existing tests that don't have one
                    if (test.getTestCode() == null || test.getTestCode().isEmpty()) {
                        test.setTestCode(generateTestCode());
                        testRepository.save(test);
                    }
                    test.setTime(test.getQuestions().size() * test.getTime());
                })
                .collect(Collectors.toList())
                .stream()
                .map(Test::getDto)
                .collect(Collectors.toList());
        }

        public TestDetailsDTO getAllQuestionsByTest(Long id){
            Optional<Test> optionalTest = testRepository.findById(id);
            TestDetailsDTO testDetailsDTO = new TestDetailsDTO();
            if(optionalTest.isPresent()){
                TestDTO testDTO = optionalTest.get().getDto();
                testDTO.setTime(optionalTest.get().getTime() * optionalTest.get().getQuestions().size());
                testDetailsDTO.setTestDTO(testDTO);
                
                testDetailsDTO.setQuestions(optionalTest.get().getQuestions().stream().map(Question::getDto).toList());
                return testDetailsDTO;
            }
            return testDetailsDTO;
        }

        public TestResultDTO submitTest(SubmitTestDTO request){
            Test test = testRepository.findById(request.getTestId())
                .orElseThrow(() -> new EntityNotFoundException("Test not found with id: " + request.getTestId()));
                
                User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new EntityNotFoundException("User not found with id: " + request.getUserId()));
                
                int correctAnswers = 0;
                for(QuestionResponse response : request.getResponses()){
                    Question question = questionRepository.findById(response.getQuestionId())
                        .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + response.getQuestionId()));
                    
                    if(question.getCorrectOption().equals(response.getSelectedOption())){
                        correctAnswers++;
                    }
                }

                int totalQuestions = test.getQuestions().size();
                double percentage = ((double) correctAnswers / totalQuestions) * 100; 
                  
                TestResult testResult = new TestResult();
                testResult.setTest(test);
                testResult.setUser(user);
                testResult.setTotalQuestions(totalQuestions);
                testResult.setCorrectAnswers(correctAnswers);
                testResult.setPercentage(percentage);

                return testResultRepository.save(testResult).getDto();
        }
        public List<TestResultDTO> getAllTestResults(){
            return testResultRepository.findAll().stream()
                .map(TestResult::getDto)
                .collect(Collectors.toList());
        }

        public List<TestResultDTO> getAllTestResultsOfUser(Long userId) {
            return testResultRepository.findAllByUserId(userId).stream()
                    .map(TestResult::getDto)
                    .collect(Collectors.toList());
        }

        @Override
        public TestDTO cancelTest(Long testId) {
            Optional<Test> optionalTest = testRepository.findById(testId);
            if (optionalTest.isPresent()) {
                Test test = optionalTest.get();
                test.setStatus("CANCELLED");
                return testRepository.save(test).getDto();
            }
            throw new EntityNotFoundException("Test not found with id: " + testId);
        }

        @Override
        public TestDTO activateTest(Long testId) {
            Optional<Test> optionalTest = testRepository.findById(testId);
            if (optionalTest.isPresent()) {
                Test test = optionalTest.get();
                test.setStatus("ACTIVE");
                return testRepository.save(test).getDto();
            }
            throw new EntityNotFoundException("Test not found with id: " + testId);
        }

        @Override
        public TestDTO getTestByCode(String testCode) {
            System.out.println("Looking for test with code: " + testCode);
            Optional<Test> optionalTest = testRepository.findByTestCode(testCode.toUpperCase());
            if (optionalTest.isPresent()) {
                Test test = optionalTest.get();
                System.out.println("Found test: " + test.getTitle() + " with status: " + test.getStatus());
                if ("ACTIVE".equals(test.getStatus()) || test.getStatus() == null) {
                    TestDTO dto = test.getDto();
                    System.out.println("Returning test DTO: " + dto.getTitle());
                    return dto;
                } else {
                    System.out.println("Test is not active, status: " + test.getStatus());
                    throw new RuntimeException("Test is not active");
                }
            }
            System.out.println("No test found with code: " + testCode);
            throw new EntityNotFoundException("Test not found with code: " + testCode);
        }
    }



