package com.quizserver.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.quizserver.dto.UserDTO;
import com.quizserver.entities.Role;
import com.quizserver.entities.User;
import com.quizserver.exception.InvalidRoleException;
import com.quizserver.exception.ResourceNotFoundException;
import com.quizserver.exception.UserInfoAlreadyExistException;
import com.quizserver.repository.RoleRepository;
import com.quizserver.repository.UserRepository;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@AllArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    PasswordEncoder passwordEncoder;

    public UserDTO registerUser(UserDTO userDto) {
        log.info("Register request received for username={}, email={}", userDto.getName(), userDto.getEmail());

        userRepository.findByName(userDto.getName()).ifPresent(u -> {
            log.error("Registration failed: Username {} already exists", userDto.getName());
            throw new UserInfoAlreadyExistException(
                    String.format("Username %s already exists", userDto.getName()));
        });

        userRepository.findByEmail(userDto.getEmail()).ifPresent(u -> {
            log.error("Registration failed: Email {} already exists", userDto.getEmail());
            throw new UserInfoAlreadyExistException(
                    String.format("Email %s already exists", userDto.getEmail()));
        });

        String roleName = userDto.getRole().toUpperCase();
        if (!List.of("ADMIN", "USER").contains(roleName)) {
            log.error("Registration failed: Invalid Role '{}'. Available roles: ADMIN, USER", roleName);
            throw new InvalidRoleException(
                    String.format("Invalid Role %s mentioned. Available roles: ADMIN, USER.", roleName));
        }

        Role role = roleRepository.findByRoleName(roleName);
        if (role == null) {
            log.error("Role '{}' not found in DB", roleName);
            throw new ResourceNotFoundException("Role not found: " + roleName);
        }

        User user = new User();
        user.setName(userDto.getName());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setRoles(List.of(role));
        
        User savedUser = userRepository.save(user);
        log.info("User '{}' registered successfully with role '{}'", savedUser.getName(), roleName);

        UserDTO responseDto = new UserDTO();
        responseDto.setId(savedUser.getId());
        responseDto.setName(savedUser.getName());
        responseDto.setEmail(savedUser.getEmail());
        responseDto.setRole(roleName);
        return responseDto;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
