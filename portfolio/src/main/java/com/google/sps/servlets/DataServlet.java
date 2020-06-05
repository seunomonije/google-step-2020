// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.ArrayList;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that handles comments on the page. */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  private ArrayList<Object> messages;

  @Override
  public void init() {
    messages = new ArrayList<>();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {

    int fetchLimit;
    
    // Grab how many comments we want to load, if fails default to 20
    fetchLimit = Integer.parseInt(getParameter(request, "quantity", "20"));

    // Send a query for the comments, latest first
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable(FetchOptions.Builder.withLimit(fetchLimit))) {
      long id = entity.getKey().getId();
      String message = (String) entity.getProperty("text");
      long timestamp = (long) entity.getProperty("timestamp");

      CommentBlock comment = new CommentBlock(id, message, timestamp);
      messages.add(message);
    }
      
    String json = convertToJsonUsingGson(messages);

    // Send the JSON as the response
    response.setContentType("application/json;");
    response.getWriter().println(json);

    messages.clear();
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {

    String input = getParameter(request, "text-input", "");
    long timestamp = System.currentTimeMillis();

    Entity commentEntity = new Entity("Comment");
    commentEntity.setProperty("text", input);
    commentEntity.setProperty("timestamp", timestamp);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(commentEntity);

    response.sendRedirect("/index.html"); // take me home
  }

  /**
   * @return the request parameter, or the default value if the parameter was not specified by the
   *     client
   */
  private String getParameter(HttpServletRequest request, String name, String defaultValue) {
    String value = request.getParameter(name);
    if (value == null) {
      return defaultValue;
    }
    return value;
  }

  /** @param arr the array that will be converted to json */
  private String convertToJsonUsingGson(ArrayList arr) {
    Gson gson = new Gson();
    String json = gson.toJson(arr);
    return json;
  }
}

/** Class which groups together each comment. */
class CommentBlock {

  public long id;
  public String message;
  public long timestamp;

  /**
   * Class constructor.
   *
   * @param id the id of the post provided by datastore
   * @param message the message content
   * @param timestamp the time of the post, used for sorting
   */
  public CommentBlock(long id, String message, long timestamp) {
    this.id = id;
    this.message = message;
    this.timestamp = timestamp;
  }
}
