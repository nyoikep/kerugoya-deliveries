import 'package:flutter/material.dart';
import 'package:kerugoya_deliveries_mobile/models/product.dart';
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/screens/cart_screen.dart';

class ProductScreen extends StatelessWidget {
  ProductScreen({super.key});

  final List<Product> products = [
    Product(id: '1', name: 'Product 1', description: 'This is a description for product 1', price: 10.0, businessId: 'b1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
    Product(id: '2', name: 'Product 2', description: 'This is a description for product 2', price: 20.0, businessId: 'b1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
    Product(id: '3', name: 'Product 3', description: 'This is a description for product 3', price: 30.0, businessId: 'b1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
    Product(id: '4', name: 'Product 4', description: 'This is a description for product 4', price: 40.0, businessId: 'b1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
    Product(id: '5', name: 'Product 5', description: 'This is a description for product 5', price: 50.0, businessId: 'b1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
      ),
      body: ListView.builder(
        itemCount: products.length,
        itemBuilder: (context, index) {
          final product = products[index];
          return Card(
            margin: const EdgeInsets.all(8.0),
            child: ListTile(
              title: Text(product.name),
              subtitle: Text(product.description ?? ''),
              trailing: Column(
                children: [
                  Text('\$${product.price.toStringAsFixed(2)}'),
                  ElevatedButton(
                    onPressed: () {
                      Provider.of<CartProvider>(context, listen: false).addItem(product);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('${product.name} added to cart!'),
                          duration: const Duration(seconds: 1),
                        ),
                      );
                    },
                    child: const Text('Add to Cart'),
                  ),
                ],
              ),
              onTap: () {
                // Handle product tap
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CartScreen()),
          );
        },
        child: const Icon(Icons.shopping_cart),
      ),
    );
  }
}
