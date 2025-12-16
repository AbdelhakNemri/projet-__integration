package com.iset.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, Object> error = new HashMap<>();
        Map<String, String> fieldErrors = new HashMap<>();
        
        e.getBindingResult().getFieldErrors().forEach(fieldError ->
            fieldErrors.put(fieldError.getField(), fieldError.getDefaultMessage())
        );
        
        error.put("error", "Validation Failed");
        error.put("message", "Input validation failed");
        error.put("fields", fieldErrors);
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getClass().getSimpleName());
        error.put("message", e.getMessage());
        error.put("cause", e.getCause() != null ? e.getCause().getMessage() : "No cause");
        
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "RuntimeException");
        error.put("message", e.getMessage());
        error.put("cause", e.getCause() != null ? e.getCause().getMessage() : "No cause");
        
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
