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
import com.google.gson.Gson;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;

import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;

import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.util.ArrayList;


/** Servlet that returns some example content. TODO: modify this file to handle comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

    private ArrayList<String> messages;

    @Override
    public void init(){
        messages = new ArrayList<>();
    }

    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {  
        // Send a query for the comments, latest first
        Query query = new Query("comments").addSort("timestamp", SortDirection.DESCENDING);
        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        PreparedQuery results = datastore.prepare(query);

        for (Entity entity: results.asIterable()) {
            long id = entity.getKey().getId();
            String message = (String)entity.getProperty("text");
            long timestamp = (long)entity.getProperty("timestamp");

            messages.add(message);

        }

        String json = convertToJsonUsingGson(messages);

        // Send the JSON as the response
        response.setContentType("application/json;");
        response.getWriter().println(json);
    }

    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException { 
        String input = getParameter(request, "text-input", "");
        long timestamp = System.currentTimeMillis();

        messages.add(input); //adds to array

        Entity commentEntity = new Entity("Comment");
        commentEntity.setProperty("text", input);
        commentEntity.setProperty("timestamp", timestamp);

        DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
        datastore.put(commentEntity);
        
        response.sendRedirect("/index.html"); //take me home
    }

    /**
     * @return the request parameter, or the default value if the parameter
     * was not specified by the client
     */
    private String getParameter(HttpServletRequest request, String name, String defaultValue) {
        String value = request.getParameter(name);
        if (value == null) {
            return defaultValue;
        }
            return value;
    }

    private String convertToJsonUsingGson(ArrayList arr) {
        Gson gson = new Gson();
        String json = gson.toJson(arr);
        return json;
    }

}

