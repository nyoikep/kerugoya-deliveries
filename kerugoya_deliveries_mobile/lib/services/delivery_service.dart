import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';

class DeliveryService {
  final AuthProvider _authProvider;

  DeliveryService(this._authProvider);

  Future<List<DeliveryRequest>> getClientDeliveryRequests() async {
    if (!_authProvider.isAuthenticated) {
      throw HttpException(message: 'User not authenticated', statusCode: 401);
    }

    try {
      final response = await ApiService.get(
        'deliveries', // Your backend endpoint for client deliveries
        token: _authProvider.token,
      );

      if (response['deliveries'] is List) {
        return (response['deliveries'] as List)
            .map((item) => DeliveryRequest.fromJson(item))
            .toList();
      } else {
        throw HttpException(message: 'Invalid delivery data format', statusCode: 500);
      }
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to fetch client delivery requests: ${e.toString()}', statusCode: 500);
    }
  }

  Future<List<DeliveryRequest>> getAvailableDeliveryRequests() async {
    if (!_authProvider.isAuthenticated) {
      throw HttpException(message: 'User not authenticated', statusCode: 401);
    }
    // Only riders should call this
    if (_authProvider.userRole != 'RIDER') {
      throw HttpException(message: 'Access denied. Only riders can view available requests.', statusCode: 403);
    }

    try {
      final response = await ApiService.get(
        'deliveries/available', // Assuming a backend endpoint for available deliveries for riders
        token: _authProvider.token,
      );

      if (response['deliveries'] is List) {
        return (response['deliveries'] as List)
            .map((item) => DeliveryRequest.fromJson(item))
            .toList();
      } else {
        throw HttpException(message: 'Invalid delivery data format', statusCode: 500);
      }
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to fetch available delivery requests: ${e.toString()}', statusCode: 500);
    }
  }

  Future<DeliveryRequest> acceptDeliveryRequest(String deliveryId) async {
    if (!_authProvider.isAuthenticated) {
      throw HttpException(message: 'User not authenticated', statusCode: 401);
    }
    if (_authProvider.userRole != 'RIDER') {
      throw HttpException(message: 'Access denied. Only riders can accept deliveries.', statusCode: 403);
    }

    try {
      final response = await ApiService.post(
        'deliveries/$deliveryId/accept',
        {}, // No body needed, deliveryId is in URL
        token: _authProvider.token,
      );
      return DeliveryRequest.fromJson(response['delivery']);
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to accept delivery request: ${e.toString()}', statusCode: 500);
    }
  }

  Future<DeliveryRequest> updateDeliveryStatus(String deliveryId, String status) async {
    if (!_authProvider.isAuthenticated) {
      throw HttpException(message: 'User not authenticated', statusCode: 401);
    }
    if (_authProvider.userRole != 'RIDER') {
      throw HttpException(message: 'Access denied. Only riders can update delivery status.', statusCode: 403);
    }

    try {
      final response = await ApiService.post(
        'deliveries/$deliveryId/status',
        {'status': status},
        token: _authProvider.token,
      );
      return DeliveryRequest.fromJson(response['delivery']);
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to update delivery status: ${e.toString()}', statusCode: 500);
    }
  }
}
