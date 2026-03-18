import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/services/api_service.dart'; // For HttpException
import 'package:kerugoya_deliveries_mobile/models/product.dart'; // Import Product model
import 'package:kerugoya_deliveries_mobile/services/product_service.dart'; // Import ProductService
import 'package:kerugoya_deliveries_mobile/services/cart_provider.dart'; // Import CartProvider

class HomeScreen extends StatefulWidget {
  final String userRole;

  const HomeScreen({super.key, required this.userRole});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Product> _products = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _fetchProducts();
  }

  Future<void> _fetchProducts() async {
    try {
      final productService = Provider.of<ProductService>(context, listen: false);
      final fetchedProducts = await productService.getProducts();
      setState(() {
        _products = fetchedProducts;
        _isLoading = false;
      });
    } on HttpException catch (e) {
      setState(() {
        _error = e.message;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load products: ${e.toString()}';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context, listen: false); // Access CartProvider

    return Scaffold(
      appBar: AppBar(
        title: Text('Welcome ${widget.userRole}'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Provider.of<AuthProvider>(context, listen: false).logout();
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text('Error: $_error'))
              : _products.isEmpty
                  ? const Center(child: Text('No products available.'))
                  : ListView.builder(
                      itemCount: _products.length,
                      itemBuilder: (context, index) {
                        final product = _products[index];
                        return Card(
                          margin: const EdgeInsets.all(8.0),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  product.name,
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  product.description ?? 'No description',
                                  style: const TextStyle(fontSize: 14),
                                ),
                                const SizedBox(height: 8),
                                Align(
                                  alignment: Alignment.bottomRight,
                                  child: Text(
                                    'Ksh ${product.price.toStringAsFixed(2)}',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.green,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Align(
                                  alignment: Alignment.bottomRight,
                                  child: ElevatedButton(
                                    onPressed: () {
                                      cart.addItem(product); // Pass the Product object
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('${product.name} added to cart!')),
                                      );
                                    },
                                    child: const Text('Add to Cart'),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}


