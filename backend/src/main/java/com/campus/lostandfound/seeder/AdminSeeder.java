package com.campus.lostandfound.seeder;

import com.campus.lostandfound.model.User;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final EntityManager entityManager;

    public AdminSeeder(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Create an initial admin user if no admins exist
        List<User> admins = entityManager.createQuery("SELECT u FROM User u WHERE u.role = :role", User.class)
                .setParameter("role", User.Role.ADMIN)
                .getResultList();

        if (admins.isEmpty()) {
            User defaultAdmin = new User();
            // This would normally be matched with a Clerk user ID created in the Clerk dashboard.
            defaultAdmin.setClerkId("admin_clerk_placeholder_id");
            defaultAdmin.setEmail("admin@campus.edu");
            defaultAdmin.setFirstName("Super");
            defaultAdmin.setLastName("Admin");
            defaultAdmin.setRole(User.Role.ADMIN);

            entityManager.persist(defaultAdmin);
            System.out.println("Default Admin user created.");
        }
    }
}
