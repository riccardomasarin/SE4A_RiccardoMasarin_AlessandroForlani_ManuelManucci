package com.nightout.backend;

import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void validUserCredentialsReturnUserRole() throws Exception {
        login("daniele.lorenzano@nightout.demo", "user123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated").value(true))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void validVenueCredentialsReturnVenueRole() throws Exception {
        login("matteo.conti@nightout.demo", "venue123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("VENUE"));
    }

    @Test
    void validPrCredentialsReturnPrRole() throws Exception {
        login("filippo.scaranello@nightout.demo", "pr123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("PR"));
    }

    @Test
    void invalidPasswordReturnsUnauthorized() throws Exception {
        login("daniele.lorenzano@nightout.demo", "wrong-password")
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unknownEmailReturnsUnauthorized() throws Exception {
        login("unknown@nightout.demo", "user123")
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginResponseNeverIncludesPassword() throws Exception {
        login("daniele.lorenzano@nightout.demo", "user123")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(content().string(
                        not(containsString("user123"))
                ));
    }

    private org.springframework.test.web.servlet.ResultActions login(
            String email,
            String password
    ) throws Exception {
        String body = """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password);

        return mockMvc.perform(
                post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body)
        );
    }
}
