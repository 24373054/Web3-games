package com.yingzhou.game.controller;

import com.yingzhou.game.dto.*;
import com.yingzhou.game.engine.GameState;
import com.yingzhou.game.model.*;
import com.yingzhou.game.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping("/eras")
    public ResponseEntity<List<EraConfig>> getEras() {
        return ResponseEntity.ok(gameService.getAllEras());
    }

    @GetMapping("/eras/{eraId}/npcs")
    public ResponseEntity<List<AINPC>> getNpcsByEra(@PathVariable int eraId) {
        return ResponseEntity.ok(gameService.getNpcsByEra(eraId));
    }

    @GetMapping("/fragments")
    public ResponseEntity<List<MemoryFragment>> getFragments() {
        return ResponseEntity.ok(gameService.getAllFragments());
    }

    @GetMapping("/minigames")
    public ResponseEntity<List<MiniGame>> getMinigames() {
        return ResponseEntity.ok(gameService.getAllMinigames());
    }

    @PostMapping("/dialogue")
    public ResponseEntity<Map<String, Object>> handleDialogue(@RequestBody DialogueRequest request) {
        Optional<MemoryFragment> fragment = gameService.handleDialogue(
                request.getPlayerId(),
                request.getNpcId(),
                request.getMessage(),
                request.getCurrentEra()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("fragmentTriggered", fragment.isPresent());
        fragment.ifPresent(f -> response.put("fragment", f));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/minigame")
    public ResponseEntity<Map<String, Object>> handleMinigame(@RequestBody MinigameRequest request) {
        Map<String, Object> result = gameService.handleMinigame(
                request.getPlayerId(),
                request.getNpcId(),
                request.getMinigameId(),
                request.getTimeUsed(),
                request.getAccuracy(),
                request.getMistakes()
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/game-state/{playerId}")
    public ResponseEntity<GameStateResponse> getGameState(@PathVariable String playerId) {
        GameState state = gameService.getOrCreatePlayerState(playerId);
        
        GameStateResponse response = new GameStateResponse(
                state.getCurrentEra(),
                new ArrayList<>(state.getCollectedFragments()),
                state.getCompletedMinigames(),
                state.getDialogueHistory()
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/game-state/{playerId}/advance-era")
    public ResponseEntity<Map<String, Object>> advanceEra(@PathVariable String playerId) {
        gameService.advanceEra(playerId);
        GameState state = gameService.getOrCreatePlayerState(playerId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("currentEra", state.getCurrentEra());
        
        return ResponseEntity.ok(response);
    }
}
