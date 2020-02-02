from django.db import models


class User(models.Model):
    number = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    weight = models.IntegerField(null=True,blank=True)
    height = models.IntegerField(null=True,blank=True)
    age = models.IntegerField(null=True,blank=True)
    CHOICES = (
        ('Male', 'Male'),
        ('Female', 'Female')
    )
    gender = models.CharField(max_length=255,choices=CHOICES,null=True,blank=True)
    sleep = models.IntegerField(blank=True,null=True)
    exercise = models.IntegerField(null=True,blank=True)
    bfp = models.IntegerField(null=True,blank=True)
    FOOD_CHOICES = (
        ('VEGETARIAN WITH EGGS', 'VEGETARIAN WITH EGGS'),
        ('VEGETARIAN WITHOUT EGGS', 'VEGETARIAN WITHOUT EGGS'),
        ('NON-VEGETARIAN', 'NON-VEGETARIAN')
    )
    food_type = models.CharField(max_length=255,choices=FOOD_CHOICES,null=True,blank=True)
    ACT_CHOICES = (
        ('LIGHT', 'LIGHT'),
        ('MODERATE', 'MODERATE'),
        ('VIGOROUS', 'VIGOROUS')
    )
    activity = models.CharField(max_length=255,choices=ACT_CHOICES,null=True,blank=True)
    goal_weight = models.IntegerField(null=True,blank=True)
    BODY_CHOICES = (
        ('ATHLETIC', 'ATHLETIC'),
        ('FIT', 'FIT'),
        ('AVERAGE', 'AVERAGE')
    )
    goal_body = models.CharField(max_length=255,choices=BODY_CHOICES,null=True,blank=True)

    def __str__(self):
        return self.number


class Message(models.Model):
    message_id = models.IntegerField()
    message_source = models.BooleanField()
    body = models.TextField()
    time = models.CharField(max_length=255)

    def __str__(self):
        return str(self.message_id)