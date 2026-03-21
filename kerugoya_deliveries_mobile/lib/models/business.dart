import 'package:kerugoya_deliveries_mobile/models/product.dart';

class Business {
  final String id;
  final String name;
  final String? description;
  final String category;
  final List<Product> products;

  Business({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    this.products = const [],
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'],
      name: json['name'],
      description: json['description'],
      category: json['category'] ?? 'Uncategorized',
      products: json['products'] != null
          ? (json['products'] as List).map((i) => Product.fromJson(i)).toList()
          : [],
    );
  }
}
