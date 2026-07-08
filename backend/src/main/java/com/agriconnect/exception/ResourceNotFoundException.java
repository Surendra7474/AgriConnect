package com.agriconnect.exception;

public class ResourceNotFoundException extends RuntimeException {

    private final String messageKey;
    private final Object[] args;

    public ResourceNotFoundException(String message) {
        super(message);
        this.messageKey = null;
        this.args = null;
    }

    public ResourceNotFoundException(String messageKey, Object... args) {
        super(messageKey); // super message as fallback
        this.messageKey = messageKey;
        this.args = args;
    }

    public String getMessageKey() {
        return messageKey;
    }

    public Object[] getArgs() {
        return args;
    }
}
