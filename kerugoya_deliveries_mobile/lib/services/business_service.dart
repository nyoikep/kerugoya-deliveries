import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/models/business.dart';
import 'package:kerugoya_deliveries_mobile/models/product.dart';

class BusinessService {
  final AuthProvider _authProvider;

  BusinessService(this._authProvider);

  Future<List<Business>> getBusinesses() async {
    try {
      final response = await ApiService.get(
        'businesses',
        token: _authProvider.token,
      );

      if (response is List) {
        return response
            .map((item) => Business.fromJson(item))
            .toList();
      } else {
        return _getMockBusinesses();
      }
    } catch (e) {
      print('Error fetching businesses, using mock data: $e');
      return _getMockBusinesses();
    }
  }

  List<Business> _getMockBusinesses() {
    return [
      Business(
        id: 'mock-1',
        name: 'Kerugoya Fresh Groceries',
        description: 'Best farm fresh vegetables and fruits in town.',
        category: 'GROCERY',
        products: [
          Product(id: 'p1', name: 'Apples (1kg)', price: 250, businessId: 'mock-1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
          Product(id: 'p2', name: 'Spinach (Bunch)', price: 50, businessId: 'mock-1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
          Product(id: 'p3', name: 'Potatoes (5kg)', price: 400, businessId: 'mock-1', createdAt: DateTime.now(), updatedAt: DateTime.now()),
        ],
      ),
      Business(
        id: 'mock-2',
        name: 'Mama Safi Food Palace',
        description: 'Authentic local dishes prepared with love.',
        category: 'FOOD',
        products: [
          Product(id: 'p4', name: 'Beef Stew & Ugali', price: 350, businessId: 'mock-2', createdAt: DateTime.now(), updatedAt: DateTime.now()),
          Product(id: 'p5', name: 'Chicken Biryani', price: 500, businessId: 'mock-2', createdAt: DateTime.now(), updatedAt: DateTime.now()),
          Product(id: 'p6', name: 'Pilau Special', price: 450, businessId: 'mock-2', createdAt: DateTime.now(), updatedAt: DateTime.now()),
        ],
      ),
      Business(
        id: 'mock-3',
        name: 'Alpha Wine & Spirits',
        description: 'Wide selection of premium beverages.',
        category: 'WINE & SPIRIT',
        products: [
          Product(id: 'p7', name: 'Johnnie Walker Red (750ml)', price: 2500, businessId: 'mock-3', createdAt: DateTime.now(), updatedAt: DateTime.now()),
          Product(id: 'p8', name: 'Caprice Red Wine', price: 1200, businessId: 'mock-3', createdAt: DateTime.now(), updatedAt: DateTime.now()),
        ],
      ),
      Business(
        id: 'mock-4',
        name: 'Kerugoya Pharmacy',
        description: 'Trusted healthcare products and medicine.',
        category: 'PHARMACY',
        products: [
          Product(id: 'p9', name: 'Panadol (Pack)', price: 150, businessId: 'mock-4', createdAt: DateTime.now(), updatedAt: DateTime.now()),
          Product(id: 'p10', name: 'Hand Sanitizer', price: 200, businessId: 'mock-4', createdAt: DateTime.now(), updatedAt: DateTime.now()),
        ],
      ),
      Business(
        id: 'mock-5',
        name: 'Central Hardware Store',
        description: 'All your building and home repair tools.',
        category: 'HARDWARE',
        products: [
          Product(id: 'p11', name: 'Hammer', price: 600, businessId: 'mock-5', createdAt: DateTime.now(), updatedAt: DateTime.now()),
          Product(id: 'p12', name: 'Screwdriver Set', price: 800, businessId: 'mock-5', createdAt: DateTime.now(), updatedAt: DateTime.now()),
        ],
      ),
    ];
  }
}
