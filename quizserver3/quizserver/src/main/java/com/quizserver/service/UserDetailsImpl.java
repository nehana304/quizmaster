package com.quizserver.service;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.quizserver.entities.Role;

import lombok.Getter;

@Getter
public class UserDetailsImpl implements UserDetails {
    private Long id;
    private String name;
    private String password;
    private List<SimpleGrantedAuthority> allRoles;

    public UserDetailsImpl(Long id, String name, String password, List<Role> allRoles) {
        this.id = id;
        this.name = name;
        this.password = password;
        this.allRoles = allRoles.stream().map((role) -> new SimpleGrantedAuthority(role.getRoleName())).toList();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return allRoles;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return name;
    }
}
