from django.shortcuts import render
from weclub.models import User, Message
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from weclub.recommend import Rec
import json


def index(request):
    return render(request, 'weclub/index.html', {})


class Register(APIView):
    permission_classes = (AllowAny,)

    def post(self,request):
        number = request.data['number']
        name = request.data['name']
        weight = request.data['weight']
        height = request.data['height']
        age = request.data['age']
        gender = request.data['gender']
        food_type = request.data['food_type']
        activity = request.data['activity']
        goal_weight = request.data['goal_weight']
        goal_body = request.data['goal_body']
        if User.objects.filter(number=number).exists():
            return Response('Failure')
        else:
            user = User.objects.create(number=number,name=name,weight=weight,height=height,age=age,gender=gender,food_type=food_type,
                                       activity=activity,goal_weight=goal_weight,goal_body=goal_body)
            return Response('Success')


class AddMessage(APIView):
    permission_classes = (AllowAny,)

    def post(self,request):
        message_source = request.data['message_source']
        body = request.data['body']
        time = request.data['time']
        if body.strip() != '':
            try:
                 message_id = Message.objects.latest('id').message_id + 1
            except Exception as e:
                message_id = 1
            Message.objects.create(message_id=message_id, message_source=message_source, body=body, time=time)
            return Response('Success')
        else:
            return Response('Failure')


class ListMessages(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        msglist = list()
        for msg in Message.objects.all():
            msglist.append([msg.message_source,msg.body,msg.time])
        return Response(msglist)


class Notify(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        number = None
        for item in request.GET.items():
            queryjson = json.loads(item[0])
            number = queryjson['number']
        if User.objects.filter(number=number).exists():
            user = User.objects.filter(number=number)[0]
            weight = user.weight
            height = user.height
            age = user.age
            gender = user.gender
            sleep = user.sleep
            exercise = user.exercise
            bfp = user.bfp
            food_type = user.food_type
            activity = user.activity
            goal_weight = user.goal_weight
            goal_body = user.goal_body

            def calc_nut(weight,height,age,gender,sleep,exercise,bfp,activity,goal_weight,goal_body):
                cur_weight = (weight+goal_weight)/2
                point_weight = 0.3*cur_weight + 0.7*goal_weight
                if gender == 'Male':
                    bmr = (10*point_weight) + (6.25*height) - (5*age) + 5
                else:
                    bmr = (10*point_weight) + (6.25*height) - (5*age) - 161
                if activity == 'LIGHT':
                    bpal = 1.55
                elif activity == 'MODERATE':
                    bpal = 1.85
                else:
                    bpal = 2.2
                if sleep < 480:
                    spal = (((480-sleep)/60) * 1.05) / 24
                else:
                    spal = 0
                pal = bpal + spal
                energy = pal*bmr + exercise
                if goal_body == 'ATHLETIC':
                    carbs = (energy * 0.65) / 4
                    fat = (energy * 0.25) / 9
                    protein = point_weight * 1.0
                elif goal_body == 'FIT':
                    carbs = (energy * 0.6) / 4
                    fat = (energy * 0.3) / 9
                    protein = point_weight * 0.9
                else:
                    carbs = (energy * 0.55) / 4
                    fat = (energy * 0.35) / 9
                    protein = point_weight * 0.8
                nutrients = {'energy':energy, 'carbs':carbs, 'fat':fat, 'protein':protein}
                return nutrients

            nutrients = calc_nut(weight,height,age,gender,450,80,15,activity,goal_weight,goal_body)
            if food_type == 'VEGETARIAN WITH EGGS':
                veg = 1
            elif food_type == 'VEGETARIAN WITHOUT EGGS':
                veg = 0
            else:
                veg = 2

            if goal_body == 'ATHLETIC':
                optm = 'Protein'
            elif goal_body == 'FIT':
                optm = 'Carbohydrates'
            else:
                optm = 'Fat'
            diet = Rec.recommend(nutrients['energy'],nutrients['protein'],nutrients['fat'],nutrients['carbs'],veg,optm)
            return Response(diet)
        else:
            return Response('Failure')


