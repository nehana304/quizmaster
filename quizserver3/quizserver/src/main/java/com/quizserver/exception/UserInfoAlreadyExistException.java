package com.quizserver.exception;

public class UserInfoAlreadyExistException extends RuntimeException {
    public UserInfoAlreadyExistException(String message) {
        super(message);
    }
}
