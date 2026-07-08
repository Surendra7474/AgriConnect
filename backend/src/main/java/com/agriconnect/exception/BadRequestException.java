package com.agriconnect.exception;

public class BadRequestException extends RuntimeException {

    private final String messageKey;
    private final Object[] args;

    public BadRequestException(String message) {
        super(message);
        this.messageKey = null;
        this.args = null;
    }

    public BadRequestException(String messageKey, Object... args) {
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
