from django.contrib import admin
from .models import User, Ticket


class UserAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        self.role = form.cleaned_data.get("role")
        super().save_model(request, obj, form, change)


# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Ticket)
