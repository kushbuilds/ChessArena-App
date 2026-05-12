package com.chessarena.service;

import com.chessarena.dto.auth.*;
import com.chessarena.model.User;
import com.chessarena.repository.UserRepository;
import com.chessarena.security.JwtTokenProvider;
import com.chessarena.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private final UserRepository           userRepo;
    private final PasswordEncoder          passwordEncoder;
    private final JwtTokenProvider         jwtProvider;
    private final AuthenticationConfiguration authConfig;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return UserPrincipal.create(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByUsername(req.getUsername()))
            throw new IllegalArgumentException("Username already taken");
        if (userRepo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("Email already registered");

        User user = User.builder()
                .username(req.getUsername())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .build();
        userRepo.save(user);

        String token = jwtProvider.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), user.getId(), user.getBlitzRating());
    }

    public AuthResponse login(LoginRequest req) throws Exception {
        var auth = authConfig.getAuthenticationManager().authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        String token = jwtProvider.generateToken(principal.getUsername());
        User user = userRepo.findByUsername(principal.getUsername()).orElseThrow();
        return new AuthResponse(token, user.getUsername(), user.getId(), user.getBlitzRating());
    }
}
