import 'package:kerugoya_deliveries_mobile/models/cart_item.dart'; // Import the CartItem model

class DeliveryRequest {
  final String id;
  final List<CartItem> cartItems;
  final String? description;
  final String clientLocation;
  final String destination;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String clientId;
  final String? clientName;
  final String? clientPhone;
  final String? riderId;

  DeliveryRequest({
    required this.id,
    required this.cartItems,
    this.description,
    required this.clientLocation,
    required this.destination,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.clientId,
    this.clientName,
    this.clientPhone,
    this.riderId,
  });

  factory DeliveryRequest.fromJson(Map<String, dynamic> json) {
    return DeliveryRequest(
      id: json['id'],
      cartItems: (json['cartItems'] as List)
          .map((itemJson) => CartItem.fromJson(itemJson))
          .toList(),
      description: json['description'],
      clientLocation: json['clientLocation'],
      destination: json['destination'],
      status: json['status'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      clientId: json['clientId'],
      clientName: json['client']?['name'],
      clientPhone: json['client']?['phone'],
      riderId: json['riderId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'cartItems': cartItems.map((item) => item.toJson()).toList(),
      'description': description,
      'clientLocation': clientLocation,
      'destination': destination,
      'status': status,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'clientId': clientId,
      'client': {
        'name': clientName,
        'phone': clientPhone,
      },
      'riderId': riderId,
    };
  }
}
