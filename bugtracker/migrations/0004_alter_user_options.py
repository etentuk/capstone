# Generated by Django 4.0 on 2021-12-19 22:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bugtracker', '0003_alter_historicalproject_name_alter_project_name'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'permissions': [('change_role', 'Can Edit the role of a User')]},
        ),
    ]