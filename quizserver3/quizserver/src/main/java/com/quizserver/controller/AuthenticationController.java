package com.quizserver.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizserver.entities.User;
import com.quizserver.repository.UserRepository;        
import com.quizserver.service.JwtService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@AllArgsConstructor
@RestController
@RequestMapping("/api")
public class AuthenticationController {
    final UserRepository userRepository;

    final JwtService jwtService;

    final AuthenticationManager authenticationManager;

    // Generate new token for existing user
    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(@RequestBody User userInfo) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(userInfo.getName(), userInfo.getPassword()));
        if (authentication.isAuthenticated()) {
            User userEntity = userRepository.findByName(userInfo.getName()).get();
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("user", userEntity);
            responseData.put("token", jwtService.generateToken(userInfo.getName()));
            return new ResponseEntity<>(responseData, HttpStatus.OK);
        } else {
            log.error("Invalid User Request");
            throw new UsernameNotFoundException("Invalid user request!");
        }
    }
}