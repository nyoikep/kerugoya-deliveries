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
        name: 'Lokko Motto',
        description: 'A club that sells wines and spirits',
        category: 'SHOP',
        isFeatured: true,
        products: [
          Product(id: 'p1', name: 'Johnnie Walker Red Label (750ml)', price: 2500, businessId: 'mock-1', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1592484944180-111ded3df9c8?q=80&w=400'),
          Product(id: 'p2', name: 'Smirnoff Vodka (750ml)', price: 1800, businessId: 'mock-1', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1594224734568-7dfba8d32d04?q=80&w=400'),
          Product(id: 'p3', name: 'Gilbeys Gin (750ml)', price: 1500, businessId: 'mock-1', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?q=80&w=400'),
        ],
      ),
      Business(
        id: 'mock-2',
        name: 'MrChips',
        description: 'The best chips in town.',
        category: 'HOTEL',
        products: [
          Product(id: 'p4', name: 'Chips Masala', price: 150, businessId: 'mock-2', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=400'),
          Product(id: 'p5', name: 'Chips and Sausage', price: 200, businessId: 'mock-2', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1626078297492-b7ca551ec442?q=80&w=400'),
        ],
      ),
      Business(
        id: 'mock-3',
        name: 'Boda Boda Services',
        description: 'Fast and reliable transport services',
        category: 'SERVICE',
        isFeatured: true,
        products: [
          Product(id: 'p6', name: 'Town Trip', price: 150, businessId: 'mock-3', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=400'),
          Product(id: 'p7', name: 'Parcel Delivery', price: 200, businessId: 'mock-3', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=400'),
        ],
      ),
      Business(
        id: 'mock-4',
        name: 'Kerugoya Hardware',
        description: 'Your one-stop shop for all hardware needs.',
        category: 'HARDWARE',
        products: [
          Product(id: 'p8', name: 'Hammer', price: 500, businessId: 'mock-4', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1586864387917-f349c4f15ee3?q=80&w=400'),
          Product(id: 'p9', name: 'Screwdriver', price: 300, businessId: 'mock-4', createdAt: DateTime.now(), updatedAt: DateTime.now(), imageUrl: 'https://images.unsplash.com/photo-1530124560676-41bc1275d4d6?q=80&w=400'),
        ],
      ),
    ];
  }
}
