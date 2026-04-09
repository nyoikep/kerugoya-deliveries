import 'package:kerugoya_deliveries_mobile/models/product.dart';

class Business {
  final String id;
  final String name;
  final String? description;
  final String category;
  final bool isFeatured;
  final List<Product> products;

  Business({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    this.isFeatured = false,
    this.products = const [],
  });

  factory Business.fromJson(Map<String, dynamic> json) {
    return Business(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      category: json['category'] ?? 'Uncategorized',
      isFeatured: json['isFeatured'] ?? false,
      products: json['products'] != null
          ? (json['products'] as List).map((i) => Product.fromJson(i)).toList()
          : [],
    );
  }
}
