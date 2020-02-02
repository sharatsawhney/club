# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2020-02-01 18:30
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=255)),
                ('name', models.CharField(max_length=255)),
                ('weight', models.IntegerField(blank=True, null=True)),
                ('height', models.IntegerField(blank=True, null=True)),
                ('age', models.IntegerField(blank=True, null=True)),
                ('gender', models.CharField(blank=True, choices=[('Male', 'Male'), ('Female', 'Female')], max_length=255, null=True)),
                ('sleep', models.IntegerField(blank=True, null=True)),
                ('exercise', models.IntegerField(blank=True, null=True)),
                ('bfp', models.IntegerField(blank=True, null=True)),
                ('food_type', models.CharField(blank=True, choices=[('VEGETARIAN WITH EGGS', 'VEGETARIAN WITH EGGS'), ('VEGETARIAN WITHOUT EGGS', 'VEGETARIAN WITHOUT EGGS'), ('NON-VEGETARIAN', 'NON-VEGETARIAN')], max_length=255, null=True)),
            ],
        ),
    ]
