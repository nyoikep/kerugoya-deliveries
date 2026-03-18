import 'package:kerugoya_deliveries_mobile/models/product.dart'; // Import the Product model

class CartItem {
  final String id;
  final String productId;
  final Product product; // Nested Product object
  final int quantity;
  final String? deliveryRequestId;

  CartItem({
    required this.id,
    required this.productId,
    required this.product,
    required this.quantity,
    this.deliveryRequestId,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      productId: json['productId'],
      product: Product.fromJson(json['product']), // Deserialize nested Product
      quantity: json['quantity'],
      deliveryRequestId: json['deliveryRequestId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productId': productId,
      'product': product.toJson(),
      'quantity': quantity,
      'deliveryRequestId': deliveryRequestId,
    };
  }
}
