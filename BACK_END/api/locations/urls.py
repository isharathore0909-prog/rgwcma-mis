from django.urls import path
from .views import DistrictListView, BlockListView, GramPanchayatListView, GPBoundaryView

urlpatterns = [
    path('districts/', DistrictListView.as_view(), name='district-list'),
    path('blocks/', BlockListView.as_view(), name='block-list'),
    path('gps/', GramPanchayatListView.as_view(), name='gp-list'),
    path('gp-boundary/', GPBoundaryView.as_view(), name='gp-boundary'),
]
