from rest_framework import serializers

from apps.core.utils import dict_keys_to_snake, dict_to_camel_case


class CamelCaseModelSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return dict_to_camel_case(data)

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = dict_keys_to_snake(data)
        return super().to_internal_value(data)


class CamelCaseSerializer(serializers.Serializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        return dict_to_camel_case(data)

    def to_internal_value(self, data):
        if isinstance(data, dict):
            data = dict_keys_to_snake(data)
        return super().to_internal_value(data)
