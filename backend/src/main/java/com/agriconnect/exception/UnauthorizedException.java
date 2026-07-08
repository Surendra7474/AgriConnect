package com.agriconnect.exception;

public class UnauthorizedException extends RuntimeException {

    private final String messageKey;
    private final Object[] args;

    public UnauthorizedException(String message) {
        super(message);
        this.messageKey = null;
        this.args = null;
    }

    public UnauthorizedException(String messageKey, Object... args) {
        super(messageKey);
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
