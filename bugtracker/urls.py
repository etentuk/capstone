
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("ticket/", views.ticket, name="ticket"),
    path("password_reset", views.password_reset_request, name="password_reset"),

    # API Endpoints
    path('userlist', views.user_list, name="user_list"),
    path('ticket/create', views.create_ticket, name="create_ticket"),
    path('ticket/details/<int:ticket_id>',
         views.get_ticket, name="get_ticket"),
    path('ticket/history/<int:ticket_id>/<int:page>',
         views.get_ticket_history, name="get_ticket_history"),
    path('ticket/all/<int:page>', views.get_all_user_tickets, name="get_all_tickets"),
    path('ticket/edit', views.edit_ticket, name="edit_ticket")
]
