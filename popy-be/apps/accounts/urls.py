from django.urls import path

from apps.accounts.views import (
    ForgotPasswordView,
    LoginView,
    LogoutView,
    RefreshTokenView,
    ResetPasswordView,
)

urlpatterns = [
    path("login", LoginView.as_view(), name="auth-login"),
    path("refresh", RefreshTokenView.as_view(), name="auth-refresh"),
    path("logout", LogoutView.as_view(), name="auth-logout"),
    path("forgot-password", ForgotPasswordView.as_view(), name="auth-forgot-password"),
    path("reset-password", ResetPasswordView.as_view(), name="auth-reset-password"),
]
