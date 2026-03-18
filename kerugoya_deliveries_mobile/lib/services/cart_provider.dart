import 'package:flutter/foundation.dart';
import 'package:kerugoya_deliveries_mobile/models/cart_item.dart';
import 'package:kerugoya_deliveries_mobile/models/product.dart';

class CartProvider with ChangeNotifier {
  Map<String, CartItem> _items = {};

  Map<String, CartItem> get items {
    return {..._items};
  }

  int get itemCount {
    return _items.length;
  }

  double get totalAmount {
    var total = 0.0;
    _items.forEach((productId, cartItem) {
      total += cartItem.product.price * cartItem.quantity; // Access price from nested product
    });
    return total;
  }

  // addItem now takes a Product object
  void addItem(Product product) {
    if (_items.containsKey(product.id)) {
      _items.update(
        product.id, // Key by product.id
        (existingCartItem) => CartItem(
          id: existingCartItem.id, // Keep existing CartItem ID
          productId: product.id,
          product: product, // Use the new product object
          quantity: existingCartItem.quantity + 1,
          deliveryRequestId: existingCartItem.deliveryRequestId,
        ),
      );
    } else {
      _items.putIfAbsent(
        product.id, // Key by product.id
        () => CartItem(
          id: DateTime.now().toString(), // Unique ID for CartItem
          productId: product.id,
          product: product,
          quantity: 1,
        ),
      );
    }
    notifyListeners();
  }

  void removeSingleItem(String productId) {
    if (!_items.containsKey(productId)) {
      return;
    }
    if (_items[productId]!.quantity > 1) {
      _items.update(
        productId,
        (existingCartItem) => CartItem(
          id: existingCartItem.id,
          productId: existingCartItem.productId,
          product: existingCartItem.product,
          quantity: existingCartItem.quantity - 1,
          deliveryRequestId: existingCartItem.deliveryRequestId,
        ),
      );
    } else {
      _items.remove(productId);
    }
    notifyListeners();
  }

  void clearCart() {
    _items = {};
    notifyListeners();
  }
}
