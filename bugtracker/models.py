from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.db.models.deletion import CASCADE, SET_NULL
from django.contrib.contenttypes.models import ContentType
from django.db.models.fields.related import ForeignKey
import uuid


class User(AbstractUser):
    ADMIN = 'ADMIN'
    PROJECT_MANAGER = 'PROJECT_MANAGER'
    SUBMITTER = 'SUBMITTER'
    DEVELOPER = 'DEVELOPER'

    ROLE_CHOICES = (
        (ADMIN, 'Admin'),
        (PROJECT_MANAGER, 'Project Manger'),
        (SUBMITTER, 'Submitter'),
        (DEVELOPER, 'Developer')
    )

    role = models.CharField(max_length=32, choices=ROLE_CHOICES)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.role == self.ADMIN:
            group = Group.objects.get(name='admins')
            group.user_set.add(self)
        elif self.role == self.PROJECT_MANAGER:
            group = Group.objects.get(name='projects')
            group.user_set.add(self)
        elif self.role == self.DEVELOPER:
            group = Group.objects.get(name='developers')
            group.user_set.add(self)
        elif self.role == self.SUBMITTER:
            group = Group.objects.get(name='submitters')
            group.user_set.add(self)


class Ticket(models.Model):
    NEW = 'New'
    OPEN = 'Open'
    INPROG = 'In Progress'
    REVIEW = 'Review'
    RESOLVED = 'Resolved'
    ADD_INFO = 'Additional Info Required'

    STATUS_CHOICES = (
        (NEW, 'New'),
        (OPEN, 'Open'),
        (INPROG, 'In Progress'),
        (REVIEW, 'Review'),
        (RESOLVED, 'Resolved'),
        (ADD_INFO, 'Additional Info Required')
    )

    BUG = 'Bugs/Errors'
    FEAT = 'Feature Request'
    OTHER = 'Other Comments'
    TRAINING = 'Training/Document Requests'

    TYPE_CHOICES = (
        (BUG, 'Bugs/Errors'),
        (FEAT, 'Feature Request'),
        (OTHER, 'Other Comments'),
        (TRAINING, 'Training/Document Requests')
    )

    LOW = 'Low'
    MID = 'Medium'
    HIGH = 'High'

    PRIORITY_CHOICES = (
        (LOW, 'Low'),
        (MID, 'Medium'),
        (HIGH, 'High')
    )

    uid = models.UUIDField(
        primary_key=False, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=128)
    description = models.TextField()
    creator = ForeignKey(User, on_delete=SET_NULL,
                         related_name="created_tickets", null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    assignee = ForeignKey(User, on_delete=SET_NULL,
                          related_name='assigned_tickets', null=True)
    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    status = models.CharField(
        max_length=32, default=OPEN, choices=STATUS_CHOICES)
    priority = models.CharField(
        max_length=16, default=MID, choices=PRIORITY_CHOICES)
    updated = models.DateTimeField(auto_now=True)
