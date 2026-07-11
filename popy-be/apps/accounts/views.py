from django.contrib.auth import get_user_model
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import UserSerializer, serialize_auth_user
from apps.core.permissions import HasPOSPermission
from apps.core.shop_context import ShopScopedMixin

User = get_user_model()


class LoginView(APIView):
    permission_classes = [AllowAny]
    shop_required = False

    def post(self, request):
        email = request.data.get("email") or request.data.get("Email")
        password = request.data.get("password") or request.data.get("Password")

        if not email or not password:
            return Response(
                {"message": "Email and password are required", "statusCode": 400},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"message": "Invalid credentials", "statusCode": 401},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active or not user.check_password(password):
            return Response(
                {"message": "Invalid credentials", "statusCode": 401},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "accessToken": str(refresh.access_token),
                "refreshToken": str(refresh),
                "user": serialize_auth_user(user),
            }
        )


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    shop_required = False

    def post(self, request):
        refresh_token = request.data.get("refreshToken") or request.data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"message": "refreshToken is required", "statusCode": 400},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            refresh = RefreshToken(refresh_token)
            user = User.objects.get(id=refresh["user_id"])
        except Exception:
            return Response(
                {"message": "Invalid or expired refresh token", "statusCode": 401},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        new_refresh = RefreshToken.for_user(user)
        try:
            refresh.blacklist()
        except Exception:
            pass

        return Response(
            {
                "accessToken": str(new_refresh.access_token),
                "refreshToken": str(new_refresh),
                "user": serialize_auth_user(user),
            }
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    shop_required = False

    def post(self, request):
        refresh_token = request.data.get("refreshToken") or request.data.get("refresh_token")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]
    shop_required = False

    def post(self, request):
        return Response(
            {"message": "If an account exists with that email, a reset link has been sent."}
        )


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    shop_required = False

    def post(self, request):
        return Response({"message": "Password reset successfully"})


class UserViewSet(ShopScopedMixin, viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, HasPOSPermission]
    required_permission_map = {
        "list": "USER_MANAGE",
        "retrieve": "USER_MANAGE",
        "create": "USER_MANAGE",
        "update": "USER_MANAGE",
        "partial_update": "USER_MANAGE",
        "destroy": "USER_MANAGE",
    }
    search_fields = ["name", "email"]
    filterset_fields = ["role", "is_active"]

    def get_queryset(self):
        return User.objects.filter(shop=self.shop).order_by("-id")

    def perform_create(self, serializer):
        password = self.request.data.get("password") or self.request.data.get("Password")
        user = serializer.save(shop=self.shop)
        from apps.core.notifications import notify_new_user

        try:
            notify_new_user(user, temporary_password=password if password else None)
        except Exception:
            pass
