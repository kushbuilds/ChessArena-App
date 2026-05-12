package com.chessarena.websocket;

import com.chessarena.dto.game.*;
import com.chessarena.service.GameService;
import com.chessarena.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import java.security.Principal;
import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameWebSocketController {

    private final GameService            gameService;
    private final UserService            userService;
    private final SimpMessagingTemplate  messaging;

    @MessageMapping("/game/move")
    public void handleMove(@Payload MoveRequest req, Principal principal) {
        try {
            Long userId = userService.getByUsername(principal.getName()).getId();
            GameStateMessage state = gameService.processMove(req.getGameId(), userId, req);
            messaging.convertAndSend("/topic/game/" + req.getGameId(), state);

            // If vs computer and game still ongoing, make computer move
            if (state != null && ("ONGOING".equals(state.getStatus()) || "IN_CHECK".equals(state.getStatus()))) {
                var game = gameService.getGame(req.getGameId());
                if (game.isVsComputer()) {
                    GameStateMessage computerState = gameService.processComputerMove(req.getGameId());
                    if (computerState != null) {
                        messaging.convertAndSend("/topic/game/" + req.getGameId(), computerState);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Move error: {}", e.getMessage());
            messaging.convertAndSendToUser(principal.getName(), "/queue/error",
                    Map.of("error", e.getMessage()));
        }
    }

    @MessageMapping("/game/resign")
    public void handleResign(@Payload Map<String, Object> payload, Principal principal) {
        try {
            Long gameId = Long.valueOf(payload.get("gameId").toString());
            Long userId = userService.getByUsername(principal.getName()).getId();
            GameStateMessage state = gameService.resignGame(gameId, userId);
            messaging.convertAndSend("/topic/game/" + gameId, state);
        } catch (Exception e) {
            log.error("Resign error: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/abort")
    public void handleAbort(@Payload Map<String, Object> payload, Principal principal) {
        try {
            Long gameId = Long.valueOf(payload.get("gameId").toString());
            Long userId = userService.getByUsername(principal.getName()).getId();
            GameStateMessage state = gameService.abortGame(gameId, userId);
            messaging.convertAndSend("/topic/game/" + gameId, state);
        } catch (Exception e) {
            log.error("Abort error: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/draw-offer")
    public void handleDrawOffer(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        GameStateMessage msg = GameStateMessage.builder()
                .type("DRAW_OFFERED")
                .gameId(gameId)
                .senderUsername(principal.getName())
                .message("Draw offered by " + principal.getName())
                .build();
        messaging.convertAndSend("/topic/game/" + gameId, msg);
    }

    @MessageMapping("/game/draw-accept")
    public void handleDrawAccept(@Payload Map<String, Object> payload, Principal principal) {
        try {
            Long gameId = Long.valueOf(payload.get("gameId").toString());
            var game = gameService.getGame(gameId);
            var userId = userService.getByUsername(principal.getName()).getId();
            // Mark game as draw
            GameStateMessage state = GameStateMessage.builder()
                    .type("GAME_UPDATE")
                    .gameId(gameId)
                    .status("DRAW_AGREED")
                    .winner("draw")
                    .resultReason("Draw by agreement")
                    .fen(game.getCurrentFen())
                    .pgn(game.getPgn())
                    .whitePlayer(game.getWhitePlayer() != null ? game.getWhitePlayer().getUsername() : "Computer")
                    .blackPlayer(game.getBlackPlayer() != null ? game.getBlackPlayer().getUsername() : "Computer")
                    .build();
            messaging.convertAndSend("/topic/game/" + gameId, state);
        } catch (Exception e) {
            log.error("Draw accept error: {}", e.getMessage());
        }
    }

    @MessageMapping("/game/message")
    public void handleChat(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        String text = payload.get("message").toString();
        GameStateMessage msg = GameStateMessage.builder()
                .type("CHAT")
                .gameId(gameId)
                .senderUsername(principal.getName())
                .message(text)
                .build();
        messaging.convertAndSend("/topic/game/" + gameId + "/chat", msg);
    }
}
