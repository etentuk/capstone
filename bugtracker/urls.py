
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("ticket/", views.ticket, name="ticket"),
    path("project/", views.project, name="project"),
    path("user_roles/", views.manage_users, name="manage_users"),
    path("profile", views.profile, name="profile"),
    path("password_reset", views.password_reset_request, name="password_reset"),

    # API Endpoints
    path('userlist', views.user_list, name="user_list"),

    # Tickets
    path('ticket/create', views.create_ticket, name="create_ticket"),
    path('ticket/details/<int:ticket_id>',
         views.get_ticket, name="get_ticket"),
    path('ticket/history/<int:ticket_id>/<int:page>',
         views.get_ticket_history, name="get_ticket_history"),
    path('ticket/all/<int:page>', views.get_all_user_tickets, name="get_all_tickets"),
    path('ticket/edit', views.edit_ticket, name="edit_ticket"),

    # Projects
    path('project/create', views.create_project, name="create_project"),
    path('project/edit', views.edit_project, name="edit_project"),
    path('project/all/<int:page>', views.get_user_projects, name="get_user_project"),
    path('project/details/<int:id>',
         views.get_project, name="get_project"),
    path('project/tickets/<int:id>/<int:page>',
         views.get_project_tickets, name="get_project"),
    path('project/assignees/<int:id>/<int:page>',
         views.get_assignees, name="get_assignees"),

    # Dashboard
    path('dashboard', views.dashboard_info, name="dashboard_info"),

    # Users
    path('user_role/edit', views.edit_user_role, name="edit_user_role"),
]
