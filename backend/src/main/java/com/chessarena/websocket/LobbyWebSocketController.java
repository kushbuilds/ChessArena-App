package com.chessarena.websocket;

import com.chessarena.dto.game.CreateGameRequest;
import com.chessarena.model.Game;
import com.chessarena.service.GameService;
import com.chessarena.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageMapping;
import java.security.Principal;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Controller
@RequiredArgsConstructor
@Slf4j
public class LobbyWebSocketController {

    private final GameService           gameService;
    private final UserService           userService;
    private final SimpMessagingTemplate messaging;

    // timeControl -> {username -> userId}
    private final ConcurrentHashMap<String, Map<String, Long>> seekQueue = new ConcurrentHashMap<>();

    @MessageMapping("/lobby/seek")
    public void seek(@Payload Map<String, Object> payload, Principal principal) {
        String timeControl = payload.getOrDefault("timeControl", "BLITZ_5").toString();
        Long userId = userService.getByUsername(principal.getName()).getId();

        seekQueue.putIfAbsent(timeControl, new ConcurrentHashMap<>());
        Map<String, Long> queue = seekQueue.get(timeControl);

        // Check if someone else is waiting
        Optional<Map.Entry<String, Long>> waiting = queue.entrySet().stream()
                .filter(e -> !e.getKey().equals(principal.getName()))
                .findFirst();

        if (waiting.isPresent()) {
            String opponentUsername = waiting.get().getKey();
            Long opponentId = waiting.get().getValue();
            queue.remove(opponentUsername);

            // Create game
            CreateGameRequest req = new CreateGameRequest();
            req.setTimeControl(timeControl);
            req.setVsComputer(false);
            req.setColor("white");

            try {
                Game game = gameService.createGame(opponentId, req);
                Game joined = gameService.joinGame(game.getId(), userId);

                Map<String, Object> gameFound = new HashMap<>();
                gameFound.put("type", "GAME_FOUND");
                gameFound.put("gameId", joined.getId());
                gameFound.put("timeControl", timeControl);
                gameFound.put("whitePlayer", joined.getWhitePlayer().getUsername());
                gameFound.put("blackPlayer", joined.getBlackPlayer().getUsername());
                gameFound.put("yourColor", "black");

                Map<String, Object> forOpponent = new HashMap<>(gameFound);
                forOpponent.put("yourColor", "white");

                messaging.convertAndSendToUser(principal.getName(), "/queue/game-found", gameFound);
                messaging.convertAndSendToUser(opponentUsername, "/queue/game-found", forOpponent);

            } catch (Exception e) {
                log.error("Match creation error: {}", e.getMessage());
            }
        } else {
            queue.put(principal.getName(), userId);
            messaging.convertAndSendToUser(principal.getName(), "/queue/lobby",
                    Map.of("type", "SEEKING", "timeControl", timeControl));
        }
    }

    @MessageMapping("/lobby/cancel")
    public void cancel(@Payload Map<String, Object> payload, Principal principal) {
        String timeControl = payload.getOrDefault("timeControl", "BLITZ_5").toString();
        Map<String, Long> queue = seekQueue.get(timeControl);
        if (queue != null) queue.remove(principal.getName());
        messaging.convertAndSendToUser(principal.getName(), "/queue/lobby",
                Map.of("type", "SEEK_CANCELLED"));
    }
}
