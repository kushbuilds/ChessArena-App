package com.chessarena.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping(value = {"/{path:(?!ws|api|h2-console)[^\\.]*}", "/{path:(?!ws|api|h2-console)[^\\.]*}/{subpath:[^\\.]*}/**"})
    public String forward() {
        return "forward:/index.html";
    }
}