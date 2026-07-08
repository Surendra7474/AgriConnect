package com.agriconnect.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_email", columnNames = "email")
})
public class User extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 20)
    private String phone;

    @Column(nullable = false)
    private Boolean active = Boolean.TRUE;

    @Column(nullable = false)
    private Boolean verified = Boolean.FALSE;

    @Column(length = 255)
    private String profileImageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column(length = 255)
    private String resetPasswordToken;

    private java.time.Instant resetPasswordTokenExpiry;

    @Column(length = 255)
    private String emailVerificationToken;

    private java.time.Instant emailVerificationTokenExpiry;

    @Column(length = 10, nullable = false)
    private String preferredLanguage = "en";
}
