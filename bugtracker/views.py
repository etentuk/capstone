from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.db.models.query_utils import Q
from django.http import HttpResponse
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.template.loader import render_to_string
from django.core.mail import send_mail, BadHeaderError
import json
from django.core.paginator import Paginator
from django.contrib.auth.decorators import permission_required


from .models import Project, User, Ticket


def index(request):
    # Authenticated users view their inbox
    if request.user.is_authenticated:
        return render(request, "bugtracker/index.html")

    # Everyone else is prompted to sign in
    else:
        return HttpResponseRedirect(reverse("login"))


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "bugtracker/authentication/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "bugtracker/authentication/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "bugtracker/authentication/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "bugtracker/authentication/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "bugtracker/authentication/register.html")


def password_reset_request(request):
    if request.method == "POST":
        data = request.POST['email']
        associated_users = User.objects.filter(Q(email=data))
        if associated_users.exists():
            for user in associated_users:
                subject = "Password Reset Requested"
                email_template_name = "bugtracker/authentication/password_reset_email.txt"
                c = {
                    "email": user.email,
                    'domain': '127.0.0.1:8000',
                    'site_name': 'Website',
                    "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                    "user": user,
                    'token': default_token_generator.make_token(user),
                    'protocol': 'http',
                }
                email = render_to_string(email_template_name, c)
                try:
                    send_mail(subject, email, 'reset@bugtracker.com',
                              [user.email], fail_silently=False)
                except BadHeaderError:
                    return HttpResponse('Invalid header found.')
        return redirect("/password_reset/done/")
    return render(request=request, template_name="bugtracker/authentication/password_reset.html")


@login_required
def ticket(request):
    return render(request, "bugtracker/tickets.html")


@login_required
def project(request):
    return render(request, "bugtracker/projects.html")


@login_required
def user_list(request):
    users = User.objects.all()
    usernames = []
    for user in users:
        usernames += [user.get_username()]
    return JsonResponse({"users": usernames}, status=200)


@login_required
def create_ticket(request):
    # Creating a new ticket must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    try:
        assignee = User.objects.get(username=data.get("username"))
    except ObjectDoesNotExist:
        assignee = None
    try:
        project = Project.objects.get(pk=data.get("project_id"))
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Project does not exist"}, status=404)
    new_ticket = Ticket(title=data.get('title'), description=data.get("description"),
                        creator=request.user, assignee=assignee, type=data.get("type"), status=data.get("status"), priority=data.get("priority"), project=project)
    new_ticket.save()
    return JsonResponse({'new_ticket': new_ticket.serialize()}, status=200)


@login_required
def get_all_user_tickets(request, page):
    user_tickets = Ticket.objects.filter(
        Q(assignee__exact=request.user) | Q(creator__exact=request.user))
    user_tickets.order_by("timestamp").all()
    _tickets = Ticket.objects.order_by("timestamp").all()
    all_tickets = Paginator(_tickets, 10)
    tickets = all_tickets.page(page)
    return JsonResponse({"tickets": [t.serialize() for t in tickets], "total_count": all_tickets.count, "total_pages": all_tickets.num_pages}, safe=False)


@login_required
def get_ticket(request, ticket_id):
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
        return JsonResponse({"ticket": ticket.serialize()}, status=200, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Ticket does not exist"}, status=404)


@login_required
def get_ticket_history(request, ticket_id, page):
    try:
        ticket = Ticket.objects.get(pk=ticket_id)
        t_history = ticket.history.all()
        delta = []
        for i in range(len(t_history)):
            if(i + 1 >= len(t_history)):
                break
            delta += [t_history[i].diff_against(t_history[i+1])]
        all_history = []
        for change in delta:
            for c in change.changes:
                all_history += [{"change": f"{c.field} changed from {c.old} to {c.new}",
                                 "timestamp": change.new_record.updated}]

        all_history = Paginator(all_history, 5)
        ticket_history = all_history.page(page)
        return JsonResponse({"ticket_history": [t for t in ticket_history], "total_pages": all_history.num_pages, "total_count": all_history.count}, status=200, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Ticket does not exist"}, status=404)


@ login_required
def edit_ticket(request):
    if request.user.has_perm('bugtracker.change_ticket'):

        if request.method != "PUT":
            return JsonResponse({"error": "Update Only Via PUT"}, status=404)
        data = json.loads(request.body)
        try:
            ticket_object = Ticket.objects.get(pk=data.get("ticket_id"))
        except ObjectDoesNotExist:
            return JsonResponse({"error": "No Ticket found"}, status=404)
        try:
            ticket_object.assignee = User.objects.get(
                username=data.get("assignee"))
        except ObjectDoesNotExist:
            assignee = None

        ticket_object.title = data.get("title")
        ticket_object.description = data.get("description")
        ticket_object.type = data.get("type")
        ticket_object.status = data.get("status")
        ticket_object.priority = data.get("priority")

        ticket_object.save()
        return JsonResponse({"message": "successfully saved!"}, status=200)
    return JsonResponse({"error": "Unauthorized!"}, status=401)


@login_required
@permission_required('bugtracker.add_project', raise_exception=True)
def create_project(request):
    if request.method != 'POST':
        return JsonResponse({"error": "POST request required."}, status=400)
    data = json.loads(request.body)
    new_project = Project(name=data.get("name"), description=data.get(
        "description"), creator=request.user)
    new_project.save()

    for user in data.get("assignees"):
        try:
            new_project.assignees.add(User.objects.get(username=user))
        except ObjectDoesNotExist:
            return JsonResponse({"error": f"User {user} does exist"}, status=400)
    return JsonResponse({'new_project': new_project.serialize()})


@login_required
def get_user_projects(request, page):
    created_user_projects = request.user.created_projects.all()
    assigned_user_projects = request.user.assigned_projects.all()
    user_projects = created_user_projects | assigned_user_projects
    user_projects.order_by("-timestamp")
    page_projects = Paginator(user_projects, 10)
    curr_page = page_projects.page(page)
    return JsonResponse({"projects": [p.serialize() for p in curr_page], "total_count": page_projects.count, "total_pages": page_projects.num_pages}, status=200)


@login_required
def get_project(request, id):
    try:
        project = Project.objects.get(pk=id)
        return JsonResponse({"project": project.serialize()}, status=200, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Ticket does not exist"}, status=404)


@login_required
def get_assignees(request, id, page):
    try:
        project = Project.objects.get(pk=id)
        assignees = project.assignees.all()
        assignees = Paginator(assignees, 10)
        curr_page = assignees.page(page)
        return JsonResponse({"assignees": [a.serialize() for a in curr_page], "total_count": assignees.count, "total_pages": assignees.num_pages}, status=200, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Project does not exist"}, status=404)


@login_required
def edit_project(request):
    if request.user.has_perm('bugtracker.change_project'):
        if request.method != "PUT":
            return JsonResponse({"error": "Update Only Via PUT"}, status=404)
        data = json.loads(request.body)
        try:
            project = Project.objects.get(pk=data.get("id"))
        except ObjectDoesNotExist:
            return JsonResponse({"error": "Project does not exist"}, status=404)
        removed_users = project.assignees.all().exclude(
            username__in=data.get("assignees"))

        for user in removed_users:
            project.assignees.remove(user)

        for user in data.get("assignees"):
            try:
                project.assignees.add(User.objects.get(username=user))
            except ObjectDoesNotExist:
                return JsonResponse({"error": f"User {user} does exist"}, status=400)
        project.name = data.get("name")
        project.description = data.get("description")

        project.save()
        return JsonResponse({"message": "successfully saved!"}, status=200)
    return JsonResponse({"error": "Unauthorized!"}, status=401)


@login_required
def get_project_tickets(request, id, page):
    try:
        project = Project.objects.get(pk=id)
        tickets = project.tickets.all()
        tickets = Paginator(tickets, 5)
        curr_page = tickets.page(page)
        return JsonResponse({"tickets": [t.serialize() for t in curr_page], "total_count": tickets.count, "total_pages": tickets.num_pages}, status=200, safe=False)
    except ObjectDoesNotExist:
        return JsonResponse({"error": "Project does not exist"}, status=404)
