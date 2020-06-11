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

    MapAndUsers obj = new MapAndUsers(mapData, votedUsers);
    response.setContentType("application/json");
    String json = convertUserToJsonUsingGson(obj);
    response.getWriter().println(json);
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String genre = request.getParameter("selGenre");
    String userId = request.getParameter("postingUser");
    int currentVotes = mapData.containsKey(genre) ? mapData.get(genre) : 0;
    mapData.put(genre, currentVotes + 1);
    votedUsers.add(userId);
    response.sendRedirect("/index.html");
  }

  /** @param obj MapAndUsers object */
  private String convertUserToJsonUsingGson(MapAndUsers obj) {
    Gson gson = new Gson();
    String json = gson.toJson(obj);
    return json;
  }
}

class MapAndUsers {
  public Map<String, Integer> hMap;
  public ArrayList<String> vUsers;

  public MapAndUsers(Map<String, Integer> hMap, ArrayList<String> vUsers) {
    this.hMap = hMap;
    this.vUsers = vUsers;
  }
}
