from django.conf.urls import url, include
from weclub import views
from weclub.views import Register,AddMessage, ListMessages, Notify

urlpatterns = [
    url(r'^$',views.index,name='index'),
    url(r'^register/', Register.as_view(), name='register'),
    url(r'^add_message/',AddMessage.as_view(),name='add_message'),
    url(r'^list_messages/',ListMessages.as_view(),name='list_messages'),
    url(r'^notify/',Notify.as_view(),name='notify'),
]