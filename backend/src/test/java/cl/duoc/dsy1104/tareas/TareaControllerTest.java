package cl.duoc.dsy1104.tareas;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

// Los tests usan H2 en memoria: no requieren MySQL ni Docker
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;MODE=MySQL",
        "spring.datasource.username=sa",
        "spring.datasource.password="
})
class TareaControllerTest {

    @Autowired
    private MockMvc mvc;

    @Test
    void creaYListaTareas() throws Exception {
        mvc.perform(post("/tareas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"Aprender Docker\",\"completada\":false}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.titulo").value("Aprender Docker"));

        mvc.perform(get("/tareas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titulo").value("Aprender Docker"));
    }

    @Test
    void rechazaTituloVacio() throws Exception {
        mvc.perform(post("/tareas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"titulo\":\"\",\"completada\":false}"))
                .andExpect(status().isBadRequest());
    }
}
