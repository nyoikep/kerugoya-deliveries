import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart'; // New import
import 'package:kerugoya_deliveries_mobile/services/api_service.dart'; // For HttpException
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart'; // For AuthProvider
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/mpesa_service.dart'; // New Import
import 'package:kerugoya_deliveries_mobile/screens/login_screen.dart';
import 'package:kerugoya_deliveries_mobile/screens/checkout_screen.dart';
import 'package:provider/provider.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Cart'),
      ),
      body: Column(
        children: <Widget>[
          Card(
            margin: const EdgeInsets.all(15),
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: <Widget>[
                  const Text(
                    'Total',
                    style: TextStyle(fontSize: 20),
                  ),
                  const Spacer(),
                  Chip(
                    label: Text(
                      'Ksh ${cart.totalAmount.toStringAsFixed(2)}', // Changed currency
                      style: Theme.of(context).primaryTextTheme.titleLarge?.copyWith(color: Colors.white), // Ensure text color is visible
                    ),
                    backgroundColor: Theme.of(context).primaryColor,
                  ),
                  TextButton(
                    onPressed: () {
                      if (cart.totalAmount <= 0) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Your cart is empty.')),
                        );
                        return;
                      }
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const CheckoutScreen()),
                      );
                    },
                    child: const Text('ORDER NOW'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: ListView.builder(
              itemCount: cart.itemCount,
              itemBuilder: (ctx, i) => CartItemWidget(
                cart.items.values.toList()[i].id,
                cart.items.keys.toList()[i],
                cart.items.values.toList()[i].product.price, // Access price from product
                cart.items.values.toList()[i].quantity,
                cart.items.values.toList()[i].product.name, // Access name from product
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class CartItemWidget extends StatelessWidget {
  final String id;
  final String productId;
  final double price;
  final int quantity;
  final String name;

  const CartItemWidget(
    this.id,
    this.productId,
    this.price,
    this.quantity,
    this.name, {
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: ListTile(
          leading: CircleAvatar(
            child: Padding(
              padding: const EdgeInsets.all(5),
              child: FittedBox(
                child: Text('Ksh $price'), // Changed currency
              ),
            ),
          ),
          title: Text(name),
          subtitle: Text('Total: Ksh ${(price * quantity)}'), // Changed currency
          trailing: Text('$quantity x'),
        ),
      ),
    );
  }
}
