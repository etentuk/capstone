# Capstone - Bugtracker

## Description

This project was completed as a requirement for the Harvard Course **CS50's Web Programming with Python and JavaScript** as such it is a Django HTML Website.

The project is a bug tracker in which users can create and manage the status of projects and tickets. Each user is assigned a role which in turn determines the actions which can be taken in the site.

It is implemented using React for the rendering of individual pages such as the project and tickets.

## How to Run

This project can be run using either docker containers or with your computer.

### On Computer

You can find the installation guide in [Installing Django](https://docs.djangoproject.com/en/3.2/topics/install/).

Once installed navigate to the root directory of the project in your terminal and run the following commands

1. `pip install django-simple-history`
2. `python3 manage.py makemigrations`
3. `python3 manage.py migrate`
4. `python3 manage.py runserver`

### Using Docker

You can find the guide to downloading Docker in [Installing Docker](https://docs.docker.com/get-docker/).

Once installed, run `docker compose up` to start the containers.

Within a new terminal run the following commands.

1. `docker ps` which will give you a container ID
2. `docker exec -it` _container_id_ `bash -l`
3. `pip install django-simple-history`
4. `python3 manage.py makemigrations`
5. `python3 manage.py migrate`
6. `python3 manage.py runserver`

## Distinctiveness and Complexity

This project is a bug tracking application which draws upon the lessons learned in this course and attempts to build upon said lessons.

It is distinct due to the fact that Role based Authorization was implemented, along with Data visualization to show a quick snapshot of the tickets belonging to a user. There are 4 User Roles within the application:

-   Admin: Can make changes to all models and Assign user roles
-   Project Manager: Can create and modify Projects and Tickets
-   Developer: Can Create and Modify Tickets, View Projects
-   Submitter: Can Only create Tickets, View Projects

The Web application is built with Django and uses React with Javascript to render the pages on the frontend. There are three models in the application, Users, Projects and Tickets.

# Features

## Authentication

Login, Logout, Forgot Passowrd Have been implemented.

For Ease of Testing Access, All new users are registered with a Role of ADMIN.

There is no mail service for the forgot password, instead the Mail is displayed within the terminal with the reset link.

## Dashboard

An entry point into the Website, a visualization to show the Tickets assigned to the User by Status, Priority, Type and Project

## Manage User Roles

Each User can Have only one role out of _ADMIN_, _PROJECT MANAGER_,_DEVELOPER_, _SUBMITTER_ . These roles can be changed within the Manage User Roles page accessible only to Users with a Role of Admin.

## Project

A Project at a high level is a collection of related Tickets which the user has registered within the system. Tickets can only be created under Projects and are directly assigned to the projects they are created from.

-   ### Project List

A Table showing all Projects a user has either created or been assigned to. From here you can choose to go to the Details or Edit Page with the right Permissions. Pagination of 10 per page and search function

-   ### Project Details

A page showing Project Assignees, information and Tickets assigned

-   ### Create And Edit Project

Creation and Editing of Tickets can only be done by Project Managers and Admins.

## Ticket

A single bug or issue currently being tracked by the User. Each Ticket is created under a Project and can have only one Assignee.

-   ### Ticket List

A list showing all tickets created by or assigned to a User. From this list you can route to Edit or Details. Pagination of 10 per page and search function

-   ### Create and Edit Ticket

A ticket can only be created from within a Project. Each Ticket can only have one Assignee which can be added at creation or edited later.

-   ### Ticket Details

This page shows fields on the Ticket along with the Change history of the Ticket.

The web application is mobile responsive although it offers the best experience on a laptop screen considering the nature of the project.

## Files Created

> ### bugtracker.js

This contains the React and JavaScript for the Project, Ticket and Manage User urls.

> ### dashboards.js

The Charts for the Dashboard Visualizations are stored here.

> ### 0002_auto_20211218_2029.py

Custom Migration which defines the permissions for Each User Group

> bugtracker/authentication

Within this folder all files are used for the login, logout, register and Password Reset of User accounts.

> ### content_container

The styling for the default container of the application.

> ### index.html

This is the entry point for the website which holds the visualizations

> ### layout.html

Default Layout and skeleton of the website

> ### manage_roles.html

Manage User Template used to hold the div which the React is rendered from.

> ### projects.html

Single Page for All Project views which are rendered using React.

> ### tickets.html

Single Page for All Ticket views which are rendered using React.

> ### user_profile.html

Page displaying User information

## Issues

The requirements.txt file was not installing the djangp-simple-history module. A workaround was to install it manually in the Docker container as suggested in the introduction.
