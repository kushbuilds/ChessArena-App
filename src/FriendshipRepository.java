package com.chessarena.repository;

import com.chessarena.model.Friendship;
import com.chessarena.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Long> {
    @Query("SELECT f FROM Friendship f WHERE (f.requester = ?1 OR f.addressee = ?1) AND f.status = 'ACCEPTED'")
    List<Friendship> findFriendships(User user);

    @Query("SELECT f FROM Friendship f WHERE f.addressee = ?1 AND f.status = 'PENDING'")
    List<Friendship> findPendingRequests(User user);

    @Query("SELECT f FROM Friendship f WHERE (f.requester = ?1 AND f.addressee = ?2) OR (f.requester = ?2 AND f.addressee = ?1)")
    Optional<Friendship> findBetweenUsers(User u1, User u2);
}
