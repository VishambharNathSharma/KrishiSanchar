package com.visioner.krishisanchar.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {
    @GetMapping("/")
    public String defaultPage() {
        // This will automatically redirect localhost:8080 to localhost:8080/login
        return "redirect:/login";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "forward:/login.html";
    }

    @GetMapping("/signup")
    public String signupPage() {
        return "forward:/signup.html";
    }
}
