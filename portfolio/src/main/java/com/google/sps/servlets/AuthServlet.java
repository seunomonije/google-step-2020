package com.google.sps.servlets;

import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/auth")
public class AuthServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    response.setContentType("application/json;");

    UserService userService = UserServiceFactory.getUserService();
    if (userService.isUserLoggedIn()) {

      String userEmail = userService.getCurrentUser().getEmail();
      String userId = userService.getCurrentUser().getUserId();
      String urlToRedirectToAfterUserLogsOut = "/";
      String logoutUrl = userService.createLogoutURL(urlToRedirectToAfterUserLogsOut);

      User user = new User(userId, userEmail, false, logoutUrl);

      String json = convertUserToJsonUsingGson(user);

      response.getWriter().println(json);
    } else {
      String urlToRedirectToAfterUserLogsIn = "/";
      String loginUrl = userService.createLoginURL(urlToRedirectToAfterUserLogsIn);

      SignInInfo info = new SignInInfo(loginUrl);

      String json = convertSignInToJsonUsingGson(info);

      response.getWriter().println(json);
    }
  }

  /** @param user the user that will be converted to json */
  private String convertUserToJsonUsingGson(User user) {
    Gson gson = new Gson();
    String json = gson.toJson(user);
    return json;
  }

  /** @param user the user that will be converted to json */
  private String convertSignInToJsonUsingGson(SignInInfo info) {
    Gson gson = new Gson();
    String json = gson.toJson(info);
    return json;
  }
}

/** Class which groups together each user. */
class User {
  public String id;
  public String email;
  public boolean active;
  public boolean hasVoted;
  public String url;

  /**
   * Class constructor.
   *
   * @param id the id of the user
   * @param email the email of the user
   * @param hasVoted boolean to set if the user has voted
   */
  public User(String id, String email, boolean hasVoted, String logoutUrl) {
    this.id = id;
    this.email = email;
    this.hasVoted = hasVoted;
    this.active = true;
    this.url = logoutUrl;
  }
}

/** Class which holds the Login Url, possibly more later. */
class SignInInfo {

  public String url;
  public boolean active;

  /**
   * Class constructor.
   *
   * @param loginUrl the given loginUrl
   */
  public SignInInfo(String loginUrl) {
    this.url = loginUrl;
    this.active = false;
  }
}
