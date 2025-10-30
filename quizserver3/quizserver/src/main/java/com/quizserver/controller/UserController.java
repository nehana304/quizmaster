package com.quizserver.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.quizserver.dto.UserDTO;
import com.quizserver.entities.User;
import com.quizserver.repository.UserRepository;
import com.quizserver.service.JwtService;
import com.quizserver.service.UserService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@AllArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    // -------- Enhanced JWT Login (from User2Controller) --------
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> loginUser(@RequestBody UserDTO userDto) {
        try {
            User user = new User();
            user.setName(userDto.getName());
            user.setPassword(userDto.getPassword());
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getName(), user.getPassword()));

            if (authentication.isAuthenticated()) {
                log.info("User {} is authenticated", user.getName());
                User userEntity = userRepository.findByName(user.getName()).get();
                Map<String, Object> responseData = new HashMap<>();
                responseData.put("user", userEntity);
                responseData.put("token", jwtService.generateToken(user.getName()));
                log.info("Token generated for {}", user.getName());
                return new ResponseEntity<>(responseData, HttpStatus.OK);
            }
        } catch (AuthenticationException e) {
            log.error("Login failed for user {}: {}", userDto.getName(), e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Invalid username or password.");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }

        Map<String, Object> errorResponse = new HashMap<>();
        log.warn("Authentication failed for unknown reason for {}", userDto.getName());
        errorResponse.put("message", "Authentication failed for unknown reason.");
        return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
    }

    // -------- Multipart Registration (from User2Controller) --------
    @PostMapping(value = "/register")
    public ResponseEntity<UserDTO> registerUser(
            @RequestBody UserDTO userDto 
            ){
        log.info("Registration endpoint hit for email={}", userDto.getEmail());

        UserDTO registeredUser = userService.registerUser(userDto);
        log.info("Registration successful for username={}", registeredUser.getName());

        return ResponseEntity.ok(registeredUser);
    }

    // -------- Basic Signup (from UserController) --------
    // @PostMapping("/sign-up")
    // public ResponseEntity<?> signupUser(@RequestBody User user) {
    //     if (userService.hasUserWithEmail(user.getEmail())) {
    //         return new ResponseEntity<>("User already exist", HttpStatus.NOT_ACCEPTABLE);
    //     }

    //     User createdUser = userService.createUser(user);
    //     if (createdUser == null) {
    //         return new ResponseEntity<>("User not created, come again later", HttpStatus.NOT_ACCEPTABLE);
    //     }
    //     return new ResponseEntity<>(createdUser, HttpStatus.OK);
    // }

    // // -------- Basic Login (from UserController, renamed for clarity) --------
    // @PostMapping("/basic-login")
    // public ResponseEntity<?> basicLogin(@RequestBody User user) {
    //     User dbUser = userService.login(user);

    //     if (dbUser == null)
    //         return new ResponseEntity<>("Wrong Conditionals", HttpStatus.NOT_ACCEPTABLE);

    //     return new ResponseEntity<>(dbUser, HttpStatus.OK);
    // }
}





// package com.quizserver.controller;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.CrossOrigin;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestBody;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;

// import com.quizserver.entities.User;
// import com.quizserver.service.user.UserService;

// @RestController
// @RequestMapping("/api/auth")
// @CrossOrigin("*")
// public class UserController {

//     @Autowired
//     private UserService userService;

//     @PostMapping("/sign-up")
//     public ResponseEntity<?> signupUser(@RequestBody User user){
//         if(userService.hasUserWithEmail(user.getEmail())){
        
//             return new ResponseEntity<>("User already exist", HttpStatus.NOT_ACCEPTABLE);
//         }

//         User createdUser = userService.createUser(user);
//         if(createdUser == null){
//             return new ResponseEntity<>("User not created, come again later", HttpStatus.NOT_ACCEPTABLE);

//         }
//         return new ResponseEntity<>(createdUser, HttpStatus.OK);
//     }

//     @PostMapping("/login")
//     public ResponseEntity<?> login(@RequestBody User user){
//         User dbUser = userService.login(user);

//         if(dbUser == null)
//             return new ResponseEntity<>("Wrong Conditionals", HttpStatus.NOT_ACCEPTABLE);
//         return new ResponseEntity<>(dbUser, HttpStatus.OK);


        
//     }
// }


