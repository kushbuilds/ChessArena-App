package com.chessarena.repository;

import com.chessarena.model.Friendship;
import com.chessarena.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("SELECT f FROM Friendship f WHERE (f.requester = :user OR f.addressee = :user) AND f.status = 'ACCEPTED'")
    List<Friendship> findFriendships(@Param("user") User user);

    @Query("SELECT f FROM Friendship f WHERE (f.requester = :u1 AND f.addressee = :u2) OR (f.requester = :u2 AND f.addressee = :u1)")
    Optional<Friendship> findBetweenUsers(@Param("u1") User u1, @Param("u2") User u2);

    @Query("SELECT f FROM Friendship f WHERE f.addressee = :user AND f.status = 'PENDING'")
    List<Friendship> findPendingRequests(@Param("user") User user);
}
