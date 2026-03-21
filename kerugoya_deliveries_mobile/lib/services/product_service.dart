import 'package:kerugoya_deliveries_mobile/services/api_service.dart';
import 'package:kerugoya_deliveries_mobile/services/auth_provider.dart';
import 'package:kerugoya_deliveries_mobile/models/product.dart';

class ProductService {
  final AuthProvider _authProvider;

  ProductService(this._authProvider);

  Future<List<Product>> getProducts() async {
    // Guest users are allowed to see products
    try {
      final response = await ApiService.get(
        'products', // Your backend endpoint for products
        token: _authProvider.token,
      );

      if (response is List) { // Check if the response itself is a List
        return response
            .map((item) => Product.fromJson(item))
            .toList();
      } else {
        throw HttpException(message: 'Invalid product data format (expected a list)', statusCode: 500);
      }
    } on HttpException {
      rethrow;
    } catch (e) {
      throw HttpException(message: 'Failed to fetch products: ${e.toString()}', statusCode: 500);
    }
  }
}
