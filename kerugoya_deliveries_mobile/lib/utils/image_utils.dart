import 'package:kerugoya_deliveries_mobile/services/api_service.dart';

class ImageUtils {
  static String getFullImageUrl(String imageUrl) {
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Prepend root URL if it's a relative path
    final root = ApiService.rootUrl;
    // Ensure no double slashes if root ends with / or imageUrl starts with /
    if (root.endsWith('/') && imageUrl.startsWith('/')) {
      return root + imageUrl.substring(1);
    } else if (!root.endsWith('/') && !imageUrl.startsWith('/')) {
      return '$root/$imageUrl';
    } else {
      return root + imageUrl;
    }
  }
}
