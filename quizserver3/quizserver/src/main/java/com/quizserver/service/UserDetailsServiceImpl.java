package com.quizserver.service;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.quizserver.entities.User;
import com.quizserver.repository.UserRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        Optional<User> user = userRepository.findByName(username);
        // but we have return UserDetails and not UserInfoEntity
        return user
                .map((userInfo) -> new UserDetailsImpl(userInfo.getId(), userInfo.getName(), userInfo.getPassword(),
                        userInfo.getRoles()))
                .orElseThrow(() -> new UsernameNotFoundException(username + " not found"));
    }
}
