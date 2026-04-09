import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/socket_service.dart';
import 'package:kerugoya_deliveries_mobile/models/delivery_request.dart';
import 'package:kerugoya_deliveries_mobile/models/cart_item.dart';
import 'package:kerugoya_deliveries_mobile/models/product.dart';

class DeliveryService {
  final AuthProvider _authProvider;

  DeliveryService(this._authProvider);

  Future<List<DeliveryRequest>> getClientDeliveryRequests() async {
    try {
      final response = await ApiService.get(
        'deliveries',
        token: _authProvider.token,
      );

      if (response is List) {
        return (response as List)
            .map((item) => DeliveryRequest.fromJson(item))
            .toList();
      } else {
        return _getMockClientDeliveries();
      }
    } catch (e) {
      print('Error fetching client deliveries, using mock data: $e');
      return _getMockClientDeliveries();
    }
  }

  Future<List<DeliveryRequest>> getAvailableDeliveryRequests() async {
    try {
      final response = await ApiService.get(
        'deliveries/available',
        token: _authProvider.token,
      );

      if (response is List) {
        return (response as List)
            .map((item) => DeliveryRequest.fromJson(item))
            .toList();
      } else {
        return _getMockAvailableDeliveries();
      }
    } catch (e) {
      print('Error fetching available deliveries, using mock data: $e');
      return _getMockAvailableDeliveries();
    }
  }

  Future<DeliveryRequest> createDeliveryRequest({
    required List<CartItem> cartItems,
    required String clientLocation,
    required String destination,
    String? riderId,
    String? scheduledAt,
    bool isExpress = false,
    double tipAmount = 0,
    SocketService? socketService, // Optional socket service to emit ping
  }) async {
    try {
      final response = await ApiService.post(
        'deliveries',
        {
          'cartItems': cartItems.map((item) => {
            'id': item.productId,
            'name': item.product.name,
            'price': item.product.price,
            'quantity': item.quantity,
          }).toList(),
          'clientLocation': clientLocation,
          'destination': destination,
          'riderId': riderId,
          'scheduledAt': scheduledAt,
          'isExpress': isExpress,
          'tipAmount': tipAmount,
        },
        token: _authProvider.token,
      );
      final delivery = DeliveryRequest.fromJson(response);
      socketService?.socket?.emit('new_delivery_ping', {
        'riderId': riderId ?? 'all',
        'delivery': delivery.toJson(),
      });
      return delivery;
    } catch (e) {
      print('Error creating delivery, returning mock success: $e');
      final mock = _getMockClientDeliveries().first;
      socketService?.socket?.emit('new_delivery_ping', {
        'riderId': riderId ?? 'all',
        'delivery': mock.toJson(),
      });
      return mock;
    }
  }

  Future<DeliveryRequest> acceptDeliveryRequest(String deliveryId) async {
    try {
      final response = await ApiService.post(
        'deliveries/$deliveryId/accept',
        {},
        token: _authProvider.token,
      );
      return DeliveryRequest.fromJson(response['delivery']);
    } catch (e) {
      print('Error accepting delivery, returning mock success: $e');
      return _getMockAvailableDeliveries().first;
    }
  }

  Future<DeliveryRequest> updateDeliveryStatus(String deliveryId, String status) async {
    try {
      final response = await ApiService.post(
        'deliveries/$deliveryId/status',
        {'status': status},
        token: _authProvider.token,
      );
      return DeliveryRequest.fromJson(response['delivery']);
    } catch (e) {
      print('Error updating status, returning mock success: $e');
      final mock = _getMockClientDeliveries().first;
      return DeliveryRequest(
        id: mock.id,
        cartItems: mock.cartItems,
        clientLocation: mock.clientLocation,
        destination: mock.destination,
        status: status,
        createdAt: mock.createdAt,
        updatedAt: DateTime.now(),
        clientId: mock.clientId,
      );
    }
  }

  List<DeliveryRequest> _getMockClientDeliveries() {
    final now = DateTime.now();
    return [
      DeliveryRequest(
        id: 'd-mock-1',
        cartItems: [
          CartItem(
            id: 'ci1',
            productId: 'p1',
            product: Product(id: 'p1', name: 'Apples', price: 250, businessId: 'b1', createdAt: now, updatedAt: now),
            quantity: 2,
          )
        ],
        clientLocation: 'Kerugoya Town',
        destination: 'Kutus Road',
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
        clientId: 'u1',
      ),
    ];
  }

  List<DeliveryRequest> _getMockAvailableDeliveries() {
    final now = DateTime.now();
    return [
      DeliveryRequest(
        id: 'd-mock-avail-1',
        cartItems: [
          CartItem(
            id: 'ci2',
            productId: 'p4',
            product: Product(id: 'p4', name: 'Beef Stew', price: 350, businessId: 'b2', createdAt: now, updatedAt: now),
            quantity: 1,
          )
        ],
        clientLocation: 'Mama Safi Palace',
        destination: 'Kerugoya Hospital',
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
        clientId: 'u2',
        clientName: 'Jane Doe',
        clientPhone: '+254 712 345 678',
      ),
    ];
  }
}
