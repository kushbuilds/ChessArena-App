package com.chessarena.service;

import com.chessarena.dto.user.*;
import com.chessarena.model.*;
import com.chessarena.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository       userRepo;
    private final FriendshipRepository friendshipRepo;

    public User getByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public User getCurrentUser(Principal principal) {
        return getByUsername(principal.getName());
    }

    public UserProfileDTO getProfile(String username) {
        User u = getByUsername(username);
        return toProfile(u);
    }

    public List<UserDTO> searchUsers(String query) {
        return userRepo.findByUsernameContainingIgnoreCase(query).stream()
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public UserProfileDTO updateProfile(Long userId, Map<String, String> updates) {
        User user = userRepo.findById(userId).orElseThrow();
        if (updates.containsKey("bio"))     user.setBio(updates.get("bio"));
        if (updates.containsKey("country")) user.setCountry(updates.get("country"));
        userRepo.save(user);
        return toProfile(user);
    }

    public List<UserDTO> getFriends(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        return friendshipRepo.findFriendships(user).stream()
                .map(f -> f.getRequester().getId().equals(userId) ? f.getAddressee() : f.getRequester())
                .map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public Friendship sendFriendRequest(Long fromId, String toUsername) {
        User from = userRepo.findById(fromId).orElseThrow();
        User to   = getByUsername(toUsername);
        if (from.getId().equals(to.getId())) throw new IllegalArgumentException("Cannot add yourself");
        friendshipRepo.findBetweenUsers(from, to).ifPresent(f -> {
            throw new IllegalArgumentException("Friendship already exists");
        });
        return friendshipRepo.save(Friendship.builder().requester(from).addressee(to).build());
    }

    @Transactional
    public Friendship acceptFriendRequest(Long friendshipId, Long userId) {
        Friendship f = friendshipRepo.findById(friendshipId).orElseThrow();
        if (!f.getAddressee().getId().equals(userId)) throw new IllegalArgumentException("Not your request");
        f.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        return friendshipRepo.save(f);
    }

    @Transactional
    public void removeFriend(Long friendshipId, Long userId) {
        Friendship f = friendshipRepo.findById(friendshipId).orElseThrow();
        if (!f.getRequester().getId().equals(userId) && !f.getAddressee().getId().equals(userId))
            throw new IllegalArgumentException("Not your friendship");
        friendshipRepo.delete(f);
    }

    public List<Friendship> getPendingRequests(Long userId) {
        User user = userRepo.findById(userId).orElseThrow();
        return friendshipRepo.findPendingRequests(user);
    }

    public UserDTO toDTO(User u) {
        return UserDTO.builder()
                .id(u.getId()).username(u.getUsername())
                .avatarUrl(u.getAvatarUrl()).blitzRating(u.getBlitzRating())
                .isOnline(u.isOnline()).country(u.getCountry())
                .build();
    }

    public UserProfileDTO toProfile(User u) {
        return UserProfileDTO.builder()
                .id(u.getId()).username(u.getUsername()).email(u.getEmail())
                .bio(u.getBio()).country(u.getCountry()).avatarUrl(u.getAvatarUrl())
                .bulletRating(u.getBulletRating()).blitzRating(u.getBlitzRating())
                .rapidRating(u.getRapidRating()).classicalRating(u.getClassicalRating())
                .puzzleRating(u.getPuzzleRating()).gamesPlayed(u.getGamesPlayed())
                .gamesWon(u.getGamesWon()).gamesLost(u.getGamesLost())
                .gamesDraw(u.getGamesDraw()).puzzlesSolved(u.getPuzzlesSolved())
                .isOnline(u.isOnline()).createdAt(u.getCreatedAt()).lastSeen(u.getLastSeen())
                .build();
    }
}
