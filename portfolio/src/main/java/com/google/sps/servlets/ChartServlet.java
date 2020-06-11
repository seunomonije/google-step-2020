package com.google.sps.servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/chart")
public class ChartServlet extends HttpServlet {

  private Map<String, Integer> mapData = new HashMap<>();
  private ArrayList<String> votedUsers = new ArrayList<>();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    response.setContentType("application/json");
    Gson gson = new Gson();
    String json = gson.toJson(mapData);
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String genre = request.getParameter("selGenre");
    int currentVotes = mapData.containsKey(genre) ? mapData.get(genre) : 0;
    mapData.put(genre, currentVotes + 1);
    response.sendRedirect("/index.html");
  }
}
