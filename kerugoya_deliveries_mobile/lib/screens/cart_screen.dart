import 'package:flutter/material.dart';
import 'package:jwt_decoder/jwt_decoder.dart'; // New import
import 'package:kerugoya_deliveries_mobile/services/api_service.dart'; // For HttpException
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart'; // For AuthProvider
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/mpesa_service.dart'; // New Import
import 'package:provider/provider.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  Future<void> _initiateMpesaPayment(BuildContext context, CartProvider cart) async {
    final mpesaService = Provider.of<MpesaService>(context, listen: false);
    final authProvider = Provider.of<AuthProvider>(context, listen: false); // Access AuthProvider

    if (!authProvider.isAuthenticated) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please log in to make a payment.')),
      );
      return;
    }

    if (cart.totalAmount <= 0) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your cart is empty.')),
      );
      return;
    }

    String? phoneNumber;
    if (authProvider.userRole == 'CLIENT' && authProvider.token != null && authProvider.token!.isNotEmpty) {
      try {
        phoneNumber = JwtDecoder.decode(authProvider.token!)['phone'] as String?;
      } catch (e) {
        // Handle potential decoding errors
        phoneNumber = null;
      }
    }


    // If phone number is not available from auth, prompt the user
    if (phoneNumber == null || phoneNumber.isEmpty) {
      final phoneController = TextEditingController();
      phoneNumber = await showDialog<String>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Enter M-Pesa Phone Number'),
          content: TextField(
            controller: phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(hintText: "e.g., 2547XXXXXXXX"),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.of(ctx).pop(phoneController.text),
              child: const Text('Proceed'),
            ),
          ],
        ),
      );
      if (!context.mounted) return;
      if (phoneNumber == null || phoneNumber.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Phone number is required for M-Pesa payment.')),
        );
        return;
      }
    }

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Initiating M-Pesa STK Push...')),
    );

    try {
      final response = await mpesaService.initiateStkPush(
        amount: cart.totalAmount, // Use actual cart total
        phoneNumber: phoneNumber,
        accountReference: 'Order_${DateTime.now().millisecondsSinceEpoch}', // Unique reference
        transactionDesc: 'Kerugoya Deliveries Payment',
      );
      if (!context.mounted) return;
      if (response['ResponseCode'] == '0') {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('STK Push sent to $phoneNumber. Please enter PIN to complete payment.')),
        );
        cart.clearCart(); // Clear cart on successful initiation
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('STK Push initiation failed: ${response['CustomerMessage'] ?? response['ResponseDescription']}')),
        );
      }
    } on HttpException catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment error: ${e.message}')),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('An unexpected error occurred: ${e.toString()}')),
      );
    }
  }

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
                    onPressed: () => _initiateMpesaPayment(context, cart), // Call the new payment method
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
